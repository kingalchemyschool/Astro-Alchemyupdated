import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { getAuth } from "@clerk/express";
import { db, savedChartsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// Strict schema for the birthInput JSONB field — mirrors the BirthInput
// interface in the frontend so only well-formed objects are persisted.
const birthInputSchema = z.object({
  name: z.string().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time must be HH:MM"),
  place: z.string().min(1).max(500),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  tz: z.number().min(-14).max(14),
  tzName: z.string().max(100).optional(),
  zodiac: z.enum(["tropical", "sidereal"]).optional(),
});

// Stricter rate limit for mutating endpoints (POST / DELETE)
const mutateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
}

// GET /api/charts — list signed-in user's saved blueprints
router.get("/charts", requireAuth, async (req: any, res) => {
  try {
    const charts = await db
      .select()
      .from(savedChartsTable)
      .where(eq(savedChartsTable.userId, req.userId))
      .orderBy(savedChartsTable.createdAt);
    res.json(charts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch charts" });
  }
});

// POST /api/charts — save a new blueprint
router.post("/charts", mutateLimiter, requireAuth, async (req: any, res) => {
  try {
    const { name, birthInput } = req.body;

    const parsed = birthInputSchema.safeParse(birthInput);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid birthInput",
        details: parsed.error.issues,
      });
    }

    const [chart] = await db
      .insert(savedChartsTable)
      .values({
        userId: req.userId,
        name: typeof name === "string" ? name.trim().slice(0, 200) || "My Blueprint" : "My Blueprint",
        birthInput: parsed.data,
      })
      .returning();
    return res.status(201).json(chart);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save chart" });
  }
});

// DELETE /api/charts/:id — delete a specific saved blueprint
router.delete("/charts/:id", mutateLimiter, requireAuth, async (req: any, res) => {
  try {
    await db
      .delete(savedChartsTable)
      .where(
        and(
          eq(savedChartsTable.id, req.params.id),
          eq(savedChartsTable.userId, req.userId),
        ),
      );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chart" });
  }
});

export default router;
