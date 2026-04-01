import { Router, type IRouter } from "express";
import { db, drawsTable, drawResultsTable, winnersTable, scoresTable, subscriptionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { CreateDrawBody, GetDrawParams, SimulateDrawParams, PublishDrawParams } from "@workspace/api-zod";

const router: IRouter = Router();

function generateRandomNumbers(count: number, min: number, max: number): number[] {
  const nums = new Set<number>();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums);
}

function countMatches(userScores: number[], drawnNumbers: number[]): number {
  return userScores.filter(s => drawnNumbers.includes(s)).length;
}

async function runDrawLogic(draw: typeof drawsTable.$inferSelect) {
  const drawnNumbers = generateRandomNumbers(5, 1, 45);
  
  // Get all active subscribers
  const activeSubscriptions = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const activeUserIds = activeSubscriptions.map(s => s.userId);

  // Get scores for active users
  const allScores = await db.select().from(scoresTable);
  const userScoresMap = new Map<number, number[]>();
  for (const score of allScores) {
    if (!activeUserIds.includes(score.userId)) continue;
    if (!userScoresMap.has(score.userId)) userScoresMap.set(score.userId, []);
    userScoresMap.get(score.userId)!.push(score.value);
  }

  const prizePool = parseFloat(draw.prizePool as string);
  const jackpotRollover = parseFloat(draw.jackpotRollover as string);
  const totalPool = prizePool + jackpotRollover;

  const tier5Pool = totalPool * 0.40;
  const tier4Pool = totalPool * 0.35;
  const tier3Pool = totalPool * 0.25;

  const tier5Winners: { userId: number; matchTier: number; prizeAmount: number }[] = [];
  const tier4Winners: { userId: number; matchTier: number; prizeAmount: number }[] = [];
  const tier3Winners: { userId: number; matchTier: number; prizeAmount: number }[] = [];

  for (const [userId, scores] of userScoresMap) {
    const matches = countMatches(scores, drawnNumbers);
    if (matches === 5) tier5Winners.push({ userId, matchTier: 5, prizeAmount: 0 });
    else if (matches === 4) tier4Winners.push({ userId, matchTier: 4, prizeAmount: 0 });
    else if (matches === 3) tier3Winners.push({ userId, matchTier: 3, prizeAmount: 0 });
  }

  // Split prizes equally per tier
  if (tier5Winners.length > 0) {
    const each = tier5Pool / tier5Winners.length;
    tier5Winners.forEach(w => w.prizeAmount = Math.round(each * 100) / 100);
  }
  if (tier4Winners.length > 0) {
    const each = tier4Pool / tier4Winners.length;
    tier4Winners.forEach(w => w.prizeAmount = Math.round(each * 100) / 100);
  }
  if (tier3Winners.length > 0) {
    const each = tier3Pool / tier3Winners.length;
    tier3Winners.forEach(w => w.prizeAmount = Math.round(each * 100) / 100);
  }

  const newJackpotRollover = tier5Winners.length === 0 ? tier5Pool : 0;

  return { drawnNumbers, tier5Winners, tier4Winners, tier3Winners, newJackpotRollover, totalPool };
}

async function enrichResults(results: { userId: number; matchTier: number; prizeAmount: number }[], drawId: number) {
  const enriched = await Promise.all(results.map(async (r) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId));
    return {
      id: 0,
      drawId,
      userId: r.userId,
      matchTier: r.matchTier,
      prizeAmount: r.prizeAmount,
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "unknown@example.com",
    };
  }));
  return enriched;
}

router.get("/draws", async (_req, res): Promise<void> => {
  const draws = await db.select().from(drawsTable).orderBy(desc(drawsTable.createdAt));
  res.json(draws);
});

router.post("/draws", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateDrawBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Calculate prize pool from active subscribers
  const activeSubscriptions = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const prizeContribution = activeSubscriptions.reduce((sum, sub) => {
    return sum + parseFloat(sub.amount as string) * 0.5; // 50% of subscription goes to prize pool
  }, 0);

  const [draw] = await db.insert(drawsTable).values({
    ...parsed.data,
    prizePool: prizeContribution.toFixed(2),
    jackpotRollover: (parsed.data.jackpotRollover ?? 0).toFixed(2) as unknown as number,
    algorithm: parsed.data.algorithm ?? "random",
  }).returning();

  res.status(201).json(draw);
});

router.get("/draws/latest", async (_req, res): Promise<void> => {
  const [draw] = await db.select().from(drawsTable)
    .where(eq(drawsTable.status, "published"))
    .orderBy(desc(drawsTable.publishedAt));
  
  if (!draw) {
    res.status(404).json({ error: "No published draws yet" });
    return;
  }

  const dbResults = await db.select().from(drawResultsTable).where(eq(drawResultsTable.drawId, draw.id));
  const results = await Promise.all(dbResults.map(async (r) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId));
    return {
      ...r,
      prizeAmount: parseFloat(r.prizeAmount as string),
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "unknown@example.com",
    };
  }));

  res.json({ ...draw, results });
});

router.get("/draws/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetDrawParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid draw ID" });
    return;
  }

  const [draw] = await db.select().from(drawsTable).where(eq(drawsTable.id, params.data.id));
  if (!draw) {
    res.status(404).json({ error: "Draw not found" });
    return;
  }

  const dbResults = await db.select().from(drawResultsTable).where(eq(drawResultsTable.drawId, draw.id));
  const results = await Promise.all(dbResults.map(async (r) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId));
    return {
      ...r,
      prizeAmount: parseFloat(r.prizeAmount as string),
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "unknown@example.com",
    };
  }));

  res.json({ ...draw, results });
});

router.post("/draws/:id/simulate", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = SimulateDrawParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid draw ID" });
    return;
  }

  const [draw] = await db.select().from(drawsTable).where(eq(drawsTable.id, params.data.id));
  if (!draw) {
    res.status(404).json({ error: "Draw not found" });
    return;
  }

  const { drawnNumbers, tier5Winners, tier4Winners, tier3Winners, totalPool } = await runDrawLogic(draw);

  const enrichedTier5 = await enrichResults(tier5Winners, draw.id);
  const enrichedTier4 = await enrichResults(tier4Winners, draw.id);
  const enrichedTier3 = await enrichResults(tier3Winners, draw.id);

  await db.update(drawsTable).set({ status: "simulated", drawnNumbers: JSON.stringify(drawnNumbers) }).where(eq(drawsTable.id, draw.id));

  res.json({
    drawnNumbers,
    tier5Winners: enrichedTier5,
    tier4Winners: enrichedTier4,
    tier3Winners: enrichedTier3,
    prizePool: totalPool,
  });
});

router.post("/draws/:id/publish", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = PublishDrawParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid draw ID" });
    return;
  }

  const [draw] = await db.select().from(drawsTable).where(eq(drawsTable.id, params.data.id));
  if (!draw) {
    res.status(404).json({ error: "Draw not found" });
    return;
  }

  if (draw.status === "published") {
    res.status(400).json({ error: "Draw already published" });
    return;
  }

  const { drawnNumbers, tier5Winners, tier4Winners, tier3Winners, newJackpotRollover } = await runDrawLogic(draw);

  // Save draw results
  const allWinners = [...tier5Winners, ...tier4Winners, ...tier3Winners];
  if (allWinners.length > 0) {
    await db.insert(drawResultsTable).values(
      allWinners.map(w => ({
        drawId: draw.id,
        userId: w.userId,
        matchTier: w.matchTier,
        prizeAmount: w.prizeAmount.toFixed(2),
      }))
    );

    // Create winner records
    await db.insert(winnersTable).values(
      allWinners.map(w => ({
        drawId: draw.id,
        userId: w.userId,
        matchTier: w.matchTier,
        prizeAmount: w.prizeAmount.toFixed(2),
      }))
    );
  }

  const [updatedDraw] = await db.update(drawsTable)
    .set({
      status: "published",
      drawnNumbers: JSON.stringify(drawnNumbers),
      jackpotRollover: newJackpotRollover.toFixed(2),
      publishedAt: new Date(),
    })
    .where(eq(drawsTable.id, draw.id))
    .returning();

  const dbResults = await db.select().from(drawResultsTable).where(eq(drawResultsTable.drawId, draw.id));
  const results = await Promise.all(dbResults.map(async (r) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId));
    return {
      ...r,
      prizeAmount: parseFloat(r.prizeAmount as string),
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "unknown@example.com",
    };
  }));

  res.json({ ...updatedDraw, results });
});

export default router;
