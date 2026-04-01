import { Router, type IRouter } from "express";
import { db, winnersTable, drawsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { UploadWinnerProofParams, UploadWinnerProofBody, VerifyWinnerParams, VerifyWinnerBody, MarkWinnerPaidParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichWinner(winner: typeof winnersTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, winner.userId));
  const [draw] = await db.select().from(drawsTable).where(eq(drawsTable.id, winner.drawId));
  return {
    ...winner,
    prizeAmount: parseFloat(winner.prizeAmount as string),
    userName: user?.name ?? "Unknown",
    userEmail: user?.email ?? "unknown@example.com",
    drawMonth: draw?.month ?? 0,
    drawYear: draw?.year ?? 0,
  };
}

router.get("/winners", authenticate, async (req, res): Promise<void> => {
  let winners;
  if (req.user!.role === "admin") {
    winners = await db.select().from(winnersTable).orderBy(desc(winnersTable.createdAt));
  } else {
    winners = await db.select().from(winnersTable)
      .where(eq(winnersTable.userId, req.user!.id))
      .orderBy(desc(winnersTable.createdAt));
  }

  const enriched = await Promise.all(winners.map(enrichWinner));
  res.json(enriched);
});

router.post("/winners/:id/upload-proof", authenticate, async (req, res): Promise<void> => {
  const params = UploadWinnerProofParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid winner ID" });
    return;
  }

  const parsed = UploadWinnerProofBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [winner] = await db.select().from(winnersTable).where(eq(winnersTable.id, params.data.id));
  if (!winner) {
    res.status(404).json({ error: "Winner record not found" });
    return;
  }

  if (req.user!.role !== "admin" && winner.userId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db.update(winnersTable)
    .set({ proofUrl: parsed.data.proofUrl, status: "pending" })
    .where(eq(winnersTable.id, params.data.id))
    .returning();

  res.json(await enrichWinner(updated));
});

router.patch("/winners/:id/verify", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = VerifyWinnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid winner ID" });
    return;
  }

  const parsed = VerifyWinnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [winner] = await db.select().from(winnersTable).where(eq(winnersTable.id, params.data.id));
  if (!winner) {
    res.status(404).json({ error: "Winner not found" });
    return;
  }

  const status = parsed.data.approved ? "approved" : "rejected";
  const [updated] = await db.update(winnersTable)
    .set({ status, adminNote: parsed.data.adminNote ?? null })
    .where(eq(winnersTable.id, params.data.id))
    .returning();

  res.json(await enrichWinner(updated));
});

router.patch("/winners/:id/mark-paid", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = MarkWinnerPaidParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid winner ID" });
    return;
  }

  const [winner] = await db.select().from(winnersTable).where(eq(winnersTable.id, params.data.id));
  if (!winner) {
    res.status(404).json({ error: "Winner not found" });
    return;
  }

  const [updated] = await db.update(winnersTable).set({ status: "paid" }).where(eq(winnersTable.id, params.data.id)).returning();
  res.json(await enrichWinner(updated));
});

export default router;
