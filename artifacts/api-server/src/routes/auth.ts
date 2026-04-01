import { Router, type IRouter } from "express";
import { db, usersTable, subscriptionsTable, userCharitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken } from "../lib/auth";
import { authenticate } from "../middlewares/authenticate";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name, charityId, charityPercent } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, name }).returning();

  // Create default subscription (inactive, demo mode)
  const now = new Date();
  const renewalDate = new Date(now);
  renewalDate.setMonth(renewalDate.getMonth() + 1);
  await db.insert(subscriptionsTable).values({
    userId: user.id,
    plan: "monthly",
    status: "inactive",
    amount: "9.99",
    startDate: now,
    renewalDate,
  });

  // Set charity selection if provided
  if (charityId) {
    await db.insert(userCharitiesTable).values({
      userId: user.id,
      charityId,
      charityPercent: charityPercent ?? 10,
    });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...userSafe } = user;
  res.status(201).json({ user: userSafe, token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...userSafe } = user;
  res.json({ user: userSafe, token });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.get("/auth/me", authenticate, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...userSafe } = user;
  res.json(userSafe);
});

export default router;
