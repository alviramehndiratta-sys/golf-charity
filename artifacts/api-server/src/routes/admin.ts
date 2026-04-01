import { Router, type IRouter } from "express";
import { db, usersTable, subscriptionsTable, drawsTable, winnersTable, userCharitiesTable, charitiesTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/admin/analytics", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const [usersCount] = await db.select({ count: count() }).from(usersTable);
  const [activeSubsCount] = await db.select({ count: count() }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const [drawsCount] = await db.select({ count: count() }).from(drawsTable);
  const [winnersCount] = await db.select({ count: count() }).from(winnersTable);
  const [pendingPayoutsCount] = await db.select({ count: count() }).from(winnersTable).where(eq(winnersTable.status, "approved"));

  // Calculate monthly revenue from active subs
  const activeSubs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const monthlyRevenue = activeSubs.reduce((sum, sub) => {
    const amount = parseFloat(sub.amount as string);
    return sum + (sub.plan === "yearly" ? amount / 12 : amount);
  }, 0);

  // Prize pool estimate (50% of subscriptions)
  const totalPrizePool = monthlyRevenue * 0.5;

  // Charity contributions (10% of subscriptions minimum)
  const totalCharityContributions = monthlyRevenue * 0.1;

  res.json({
    totalUsers: usersCount.count,
    activeSubscribers: activeSubsCount.count,
    totalPrizePool: Math.round(totalPrizePool * 100) / 100,
    totalCharityContributions: Math.round(totalCharityContributions * 100) / 100,
    totalDraws: drawsCount.count,
    totalWinners: winnersCount.count,
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    pendingPayouts: pendingPayoutsCount.count,
  });
});

router.get("/admin/prize-pool", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const activeSubs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));

  const monthlyContribution = activeSubs.reduce((sum, sub) => {
    const amount = parseFloat(sub.amount as string);
    const monthly = sub.plan === "yearly" ? amount / 12 : amount;
    return sum + monthly * 0.5;
  }, 0);

  const currentPool = monthlyContribution;
  const jackpotRollover = 0; // Would come from last draw

  const tier5Prize = currentPool * 0.40;
  const tier4Prize = currentPool * 0.35;
  const tier3Prize = currentPool * 0.25;

  res.json({
    currentPool: Math.round(currentPool * 100) / 100,
    jackpotRollover,
    tier5Prize: Math.round(tier5Prize * 100) / 100,
    tier4Prize: Math.round(tier4Prize * 100) / 100,
    tier3Prize: Math.round(tier3Prize * 100) / 100,
    activeSubscribers: activeSubs.length,
    monthlyContribution: Math.round(monthlyContribution * 100) / 100,
  });
});

export default router;
