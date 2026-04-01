import { Router, type IRouter } from "express";
import { db, charitiesTable, userCharitiesTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import {
  CreateCharityBody,
  UpdateCharityBody,
  UpdateCharityParams,
  DeleteCharityParams,
  GetCharityParams,
  ListCharitiesQueryParams,
  SetMyCharitySelectionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/charities/featured", async (_req, res): Promise<void> => {
  const charities = await db.select().from(charitiesTable).where(eq(charitiesTable.featured, true));
  res.json(charities);
});

router.get("/charities/my-selection", authenticate, async (req, res): Promise<void> => {
  const [userCharity] = await db.select().from(userCharitiesTable)
    .where(eq(userCharitiesTable.userId, req.user!.id));
  if (!userCharity) {
    res.status(404).json({ error: "No charity selection found" });
    return;
  }

  const [charity] = await db.select().from(charitiesTable).where(eq(charitiesTable.id, userCharity.charityId));
  res.json({ ...userCharity, charity });
});

router.post("/charities/my-selection", authenticate, async (req, res): Promise<void> => {
  const parsed = SetMyCharitySelectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { charityId, charityPercent } = parsed.data;
  if (charityPercent < 10 || charityPercent > 100) {
    res.status(400).json({ error: "Charity percent must be between 10 and 100" });
    return;
  }

  const [charityExists] = await db.select().from(charitiesTable).where(eq(charitiesTable.id, charityId));
  if (!charityExists) {
    res.status(404).json({ error: "Charity not found" });
    return;
  }

  const [existing] = await db.select().from(userCharitiesTable).where(eq(userCharitiesTable.userId, req.user!.id));
  let result;
  if (existing) {
    const [updated] = await db.update(userCharitiesTable)
      .set({ charityId, charityPercent })
      .where(eq(userCharitiesTable.userId, req.user!.id))
      .returning();
    result = updated;
  } else {
    const [created] = await db.insert(userCharitiesTable).values({
      userId: req.user!.id,
      charityId,
      charityPercent,
    }).returning();
    result = created;
  }

  const [charity] = await db.select().from(charitiesTable).where(eq(charitiesTable.id, charityId));
  res.json({ ...result, charity });
});

router.get("/charities", async (req, res): Promise<void> => {
  const queryParsed = ListCharitiesQueryParams.safeParse(req.query);
  const { search, category } = queryParsed.success ? queryParsed.data : { search: undefined, category: undefined };

  let charities = await db.select().from(charitiesTable);

  if (search) {
    charities = charities.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (category) {
    charities = charities.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  res.json(charities);
});

router.post("/charities", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCharityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [charity] = await db.insert(charitiesTable).values({
    ...parsed.data,
    featured: parsed.data.featured ?? false,
  }).returning();
  res.status(201).json(charity);
});

router.get("/charities/:id", async (req, res): Promise<void> => {
  const params = GetCharityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid charity ID" });
    return;
  }

  const [charity] = await db.select().from(charitiesTable).where(eq(charitiesTable.id, params.data.id));
  if (!charity) {
    res.status(404).json({ error: "Charity not found" });
    return;
  }
  res.json(charity);
});

router.patch("/charities/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCharityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid charity ID" });
    return;
  }

  const parsed = UpdateCharityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db.update(charitiesTable).set(parsed.data).where(eq(charitiesTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Charity not found" });
    return;
  }
  res.json(updated);
});

router.delete("/charities/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCharityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid charity ID" });
    return;
  }

  const [deleted] = await db.delete(charitiesTable).where(eq(charitiesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Charity not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
