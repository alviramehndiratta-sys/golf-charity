import { Router, type IRouter } from "express";
import { db, scoresTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { AddScoreBody, UpdateScoreBody, UpdateScoreParams, DeleteScoreParams, GetUserScoresParams } from "@workspace/api-zod";

const router: IRouter = Router();

const MAX_SCORES = 5;

router.get("/scores", authenticate, async (req, res): Promise<void> => {
  const scores = await db.select().from(scoresTable)
    .where(eq(scoresTable.userId, req.user!.id))
    .orderBy(desc(scoresTable.scoreDate));
  res.json(scores);
});

router.post("/scores", authenticate, async (req, res): Promise<void> => {
  const parsed = AddScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { value, scoreDate } = parsed.data;
  if (value < 1 || value > 45) {
    res.status(400).json({ error: "Score must be between 1 and 45" });
    return;
  }

  // Check current score count
  const existingScores = await db.select().from(scoresTable)
    .where(eq(scoresTable.userId, req.user!.id))
    .orderBy(asc(scoresTable.scoreDate));

  if (existingScores.length >= MAX_SCORES) {
    // Remove oldest score
    await db.delete(scoresTable).where(eq(scoresTable.id, existingScores[0].id));
  }

  const [score] = await db.insert(scoresTable).values({
    userId: req.user!.id,
    value,
    scoreDate: new Date(scoreDate),
  }).returning();

  res.status(201).json(score);
});

router.patch("/scores/:id", authenticate, async (req, res): Promise<void> => {
  const params = UpdateScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid score ID" });
    return;
  }

  const parsed = UpdateScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(scoresTable).where(eq(scoresTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Score not found" });
    return;
  }

  if (existing.userId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (parsed.data.value !== undefined && (parsed.data.value < 1 || parsed.data.value > 45)) {
    res.status(400).json({ error: "Score must be between 1 and 45" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.value !== undefined) updateData.value = parsed.data.value;
  if (parsed.data.scoreDate !== undefined) updateData.scoreDate = new Date(parsed.data.scoreDate);

  const [updated] = await db.update(scoresTable).set(updateData).where(eq(scoresTable.id, params.data.id)).returning();
  res.json(updated);
});

router.delete("/scores/:id", authenticate, async (req, res): Promise<void> => {
  const params = DeleteScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid score ID" });
    return;
  }

  const [existing] = await db.select().from(scoresTable).where(eq(scoresTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Score not found" });
    return;
  }

  if (existing.userId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(scoresTable).where(eq(scoresTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/scores/user/:userId", authenticate, async (req, res): Promise<void> => {
  const params = GetUserScoresParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (req.user!.role !== "admin" && req.user!.id !== params.data.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const scores = await db.select().from(scoresTable)
    .where(eq(scoresTable.userId, params.data.userId))
    .orderBy(desc(scoresTable.scoreDate));
  res.json(scores);
});

export default router;
