import { Router, type IRouter } from "express";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { UpdateUserBody, ListUsersQueryParams, GetUserParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const queryParsed = ListUsersQueryParams.safeParse(req.query);
  const search = queryParsed.success ? queryParsed.data.search : undefined;

  let users;
  if (search) {
    users = await db.select().from(usersTable).where(
      or(
        ilike(usersTable.name, `%${search}%`),
        ilike(usersTable.email, `%${search}%`)
      )
    );
  } else {
    users = await db.select().from(usersTable);
  }

  const result = await Promise.all(
    users.map(async (user) => {
      const { passwordHash: _, ...userSafe } = user;
      const [subscription] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, user.id));
      return { ...userSafe, subscription: subscription ?? null };
    })
  );

  res.json(result);
});

router.get("/users/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  // Users can only view their own profile unless admin
  if (req.user!.role !== "admin" && req.user!.id !== params.data.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [subscription] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, user.id));
  const { passwordHash: _, ...userSafe } = user;
  res.json({ ...userSafe, subscription: subscription ?? null });
});

router.patch("/users/:id", authenticate, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  // Users can only update their own profile unless admin
  if (req.user!.role !== "admin" && req.user!.id !== id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { passwordHash: _, ...userSafe } = updated;
  res.json(userSafe);
});

export default router;
