import { Router, type IRouter } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { CreateSubscriptionBody } from "@workspace/api-zod";

const router: IRouter = Router();

const PLAN_AMOUNTS: Record<string, string> = {
  monthly: "9.99",
  yearly: "99.00",
};

router.get("/subscriptions/my", authenticate, async (req, res): Promise<void> => {
  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.user!.id));
  if (!sub) {
    res.status(404).json({ error: "No subscription found" });
    return;
  }
  res.json(sub);
});

router.post("/subscriptions", authenticate, async (req, res): Promise<void> => {
  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { plan } = parsed.data;
  if (!["monthly", "yearly"].includes(plan)) {
    res.status(400).json({ error: "Plan must be monthly or yearly" });
    return;
  }

  const amount = PLAN_AMOUNTS[plan] ?? "9.99";
  const now = new Date();
  const renewalDate = new Date(now);
  if (plan === "monthly") {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  // Check if subscription already exists
  const [existing] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.user!.id));
  
  if (existing) {
    const [updated] = await db.update(subscriptionsTable)
      .set({ plan, status: "active", amount, startDate: now, renewalDate })
      .where(eq(subscriptionsTable.userId, req.user!.id))
      .returning();
    res.status(201).json(updated);
    return;
  }

  const [sub] = await db.insert(subscriptionsTable).values({
    userId: req.user!.id,
    plan,
    status: "active",
    amount,
    startDate: now,
    renewalDate,
  }).returning();

  res.status(201).json(sub);
});

router.patch("/subscriptions/:id/cancel", authenticate, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
  if (!sub) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  if (req.user!.role !== "admin" && sub.userId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db.update(subscriptionsTable)
    .set({ status: "cancelled" })
    .where(eq(subscriptionsTable.id, id))
    .returning();

  res.json(updated);
});

router.patch("/subscriptions/:id/renew", authenticate, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
  if (!sub) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  if (req.user!.role !== "admin" && sub.userId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const now = new Date();
  const renewalDate = new Date(now);
  if (sub.plan === "monthly") {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  const [updated] = await db.update(subscriptionsTable)
    .set({ status: "active", renewalDate, startDate: now })
    .where(eq(subscriptionsTable.id, id))
    .returning();

  res.json(updated);
});

export default router;
