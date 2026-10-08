import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

// 1. Uploaded Images Table (stores permanent image metadata & storage URLs)
export const uploadedImagesTable = pgTable("uploaded_images", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  storageProvider: text("storage_provider").notNull(), // 'vercel_blob' | 'database' | 'cloudinary' | 's3'
  data: text("data"), // base64 encoded payload for persistent database storage fallback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUploadedImageSchema = createInsertSchema(uploadedImagesTable);
export const selectUploadedImageSchema = createSelectSchema(uploadedImagesTable);
export type UploadedImage = typeof uploadedImagesTable.$inferSelect;
export type InsertUploadedImage = typeof uploadedImagesTable.$inferInsert;

// 2. Plants Table (persists nursery plants with permanent image URLs)
export const plantsTable = pgTable("plants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  category: text("category"),
  description: text("description"),
  image: text("image").notNull(),
  spacing: text("spacing"),
  plantsPerAcre: integer("plants_per_acre"),
  growth: text("growth"),
  fertilizer: text("fertilizer"),
  maintenance: text("maintenance"),
  price: integer("price"),
  sizePrices: jsonb("size_prices"),
  sizeAvailability: jsonb("size_availability"),
  sizeDetails: jsonb("size_details"),
  expectedYieldPerPlant: integer("expected_yield_per_plant"),
  yieldUnit: text("yield_unit"),
  expectedSellingPricePerKg: integer("expected_selling_price_per_kg"),
  harvestsPerYear: integer("harvests_per_year"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlantSchema = createInsertSchema(plantsTable);
export const selectPlantSchema = createSelectSchema(plantsTable);
export type PlantRecord = typeof plantsTable.$inferSelect;
export type InsertPlantRecord = typeof plantsTable.$inferInsert;

// 3. Global Nursery State Table (persists synced plants, bills, plans, settings across users and sessions)
export const appStateTable = pgTable("app_state", {
  key: text("key").primaryKey(), // 'etr_nursery_state'
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppStateSchema = createInsertSchema(appStateTable);
export type AppStateRecord = typeof appStateTable.$inferSelect;