import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// In-memory fallback if database URL is not configured
let inMemoryAppState: any = null;
let inMemoryPlants: Map<string, any> = new Map();

/**
 * GET /api/state
 * Returns global nursery state stored in PostgreSQL
 */
router.get("/state", async (_req: Request, res: Response) => {
  try {
    if (pool) {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT data, updated_at FROM app_state WHERE key = 'etr_nursery_state' LIMIT 1`
        );
        if (result.rows.length > 0) {
          return res.json({
            success: true,
            state: result.rows[0].data,
            updatedAt: result.rows[0].updated_at,
          });
        }
      } finally {
        client.release();
      }
    }

    if (inMemoryAppState) {
      return res.json({
        success: true,
        state: inMemoryAppState,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.json({ success: true, state: null });
  } catch (err: any) {
    logger.error({ err }, "Error reading nursery state");
    return res.status(500).json({ error: "Failed to read nursery state" });
  }
});

/**
 * POST /api/state
 * Persists updated global state into PostgreSQL
 */
router.post("/state", async (req: Request, res: Response) => {
  try {
    const { state } = req.body;
    if (!state || typeof state !== "object") {
      return res.status(400).json({ error: "State object is required" });
    }

    inMemoryAppState = state;

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO app_state (key, data, updated_at)
           VALUES ('etr_nursery_state', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW()`,
          [JSON.stringify(state)]
        );

        // Also sync plants table if state.plants is present
        if (Array.isArray(state.plants)) {
          for (const p of state.plants) {
            if (!p.id || !p.name) continue;
            await client.query(
              `INSERT INTO plants (
                id, name, short_name, category, description, image, spacing,
                plants_per_acre, growth, fertilizer, maintenance, price,
                size_prices, size_availability, size_details,
                expected_yield_per_plant, yield_unit, expected_selling_price_per_kg,
                harvests_per_year, color, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
              ON CONFLICT (id) DO UPDATE SET
                name = $2, short_name = $3, category = $4, description = $5,
                image = $6, spacing = $7, plants_per_acre = $8, growth = $9,
                fertilizer = $10, maintenance = $11, price = $12, size_prices = $13,
                size_availability = $14, size_details = $15, expected_yield_per_plant = $16,
                yield_unit = $17, expected_selling_price_per_kg = $18,
                harvests_per_year = $19, color = $20, updated_at = NOW()`,
              [
                p.id,
                p.name,
                p.shortName || p.name,
                p.category || "Fruit plants",
                p.description || "",
                p.image || "",
                p.spacing || "12 × 12 ft",
                Number(p.plantsPerAcre || 100),
                p.growth || "3–4 years",
                p.fertilizer || "6 kg / year",
                p.maintenance || "Moderate",
                Number(p.price || 100),
                JSON.stringify(p.sizePrices || {}),
                JSON.stringify(p.sizeAvailability || {}),
                JSON.stringify(p.sizeDetails || {}),
                Number(p.expectedYieldPerPlant || 0),
                p.yieldUnit || "kg",
                Number(p.expectedSellingPricePerKg || 0),
                Number(p.harvestsPerYear || 1),
                p.color || "#98bf77",
              ]
            );
          }
        }
      } finally {
        client.release();
      }
    }

    return res.json({ success: true });
  } catch (err: any) {
    logger.error({ err }, "Error saving nursery state");
    return res.status(500).json({ error: "Failed to save state" });
  }
});

/**
 * GET /api/plants
 * Returns all plants saved in PostgreSQL
 */
router.get("/plants", async (_req: Request, res: Response) => {
  try {
    if (pool) {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM plants ORDER BY created_at ASC`
        );
        if (result.rows.length > 0) {
          const plants = result.rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            shortName: row.short_name,
            category: row.category,
            description: row.description,
            image: row.image,
            spacing: row.spacing,
            plantsPerAcre: row.plants_per_acre,
            growth: row.growth,
            fertilizer: row.fertilizer,
            maintenance: row.maintenance,
            price: row.price,
            sizePrices: row.size_prices,
            sizeAvailability: row.size_availability,
            sizeDetails: row.size_details,
            expectedYieldPerPlant: row.expected_yield_per_plant,
            yieldUnit: row.yield_unit,
            expectedSellingPricePerKg: row.expected_selling_price_per_kg,
            harvestsPerYear: row.harvests_per_year,
            color: row.color,
          }));
          return res.json({ success: true, plants });
        }
      } finally {
        client.release();
      }
    }

    if (inMemoryPlants.size > 0) {
      return res.json({
        success: true,
        plants: Array.from(inMemoryPlants.values()),
      });
    }

    return res.json({ success: true, plants: [] });
  } catch (err: any) {
    logger.error({ err }, "Error fetching plants");
    return res.status(500).json({ error: "Failed to fetch plants" });
  }
});

/**
 * POST /api/plants
 * Inserts or updates an individual plant with permanent image URL
 */
router.post("/plants", async (req: Request, res: Response) => {
  try {
    const p = req.body;
    if (!p.id || !p.name) {
      return res.status(400).json({ error: "Plant ID and Name are required" });
    }

    inMemoryPlants.set(p.id, p);

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO plants (
            id, name, short_name, category, description, image, spacing,
            plants_per_acre, growth, fertilizer, maintenance, price,
            size_prices, size_availability, size_details,
            expected_yield_per_plant, yield_unit, expected_selling_price_per_kg,
            harvests_per_year, color, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = $2, short_name = $3, category = $4, description = $5,
            image = $6, spacing = $7, plants_per_acre = $8, growth = $9,
            fertilizer = $10, maintenance = $11, price = $12, size_prices = $13,
            size_availability = $14, size_details = $15, expected_yield_per_plant = $16,
            yield_unit = $17, expected_selling_price_per_kg = $18,
            harvests_per_year = $19, color = $20, updated_at = NOW()`,
          [
            p.id,
            p.name,
            p.shortName || p.name,
            p.category || "Fruit plants",
            p.description || "",
            p.image || "",
            p.spacing || "12 × 12 ft",
            Number(p.plantsPerAcre || 100),
            p.growth || "3–4 years",
            p.fertilizer || "6 kg / year",
            p.maintenance || "Moderate",
            Number(p.price || 100),
            JSON.stringify(p.sizePrices || {}),
            JSON.stringify(p.sizeAvailability || {}),
            JSON.stringify(p.sizeDetails || {}),
            Number(p.expectedYieldPerPlant || 0),
            p.yieldUnit || "kg",
            Number(p.expectedSellingPricePerKg || 0),
            Number(p.harvestsPerYear || 1),
            p.color || "#98bf77",
          ]
        );
      } finally {
        client.release();
      }
    }

    return res.json({ success: true, plant: p });
  } catch (err: any) {
    logger.error({ err }, "Error saving plant");
    return res.status(500).json({ error: "Failed to save plant" });
  }
});

/**
 * DELETE /api/plants/:id
 */
router.delete("/plants/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (id) {
      inMemoryPlants.delete(id);
    }

    if (pool && id) {
      const client = await pool.connect();
      try {
        await client.query(`DELETE FROM plants WHERE id = $1`, [id]);
      } finally {
        client.release();
      }
    }

    return res.json({ success: true });
  } catch (err: any) {
    logger.error({ err }, "Error deleting plant");
    return res.status(500).json({ error: "Failed to delete plant" });
  }
});

export default router;
