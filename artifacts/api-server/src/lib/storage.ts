import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { pool } from "@workspace/db";
import { logger } from "./logger.js";

// In-memory fallback cache (preserves images within server lifecycle / dev)
const memoryImageStore = new Map<
  string,
  {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
    buffer: Buffer;
    url: string;
    storageProvider: string;
    createdAt: Date;
  }
>();

export interface UploadResult {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  storageProvider: "vercel_blob" | "database" | "memory_fallback";
}

/**
 * Validates image MIME type and file size (max 10MB)
 */
export function validateImage(mimetype: string, size: number): { valid: boolean; error?: string } {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
  ];
  if (!allowedTypes.includes(mimetype.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${mimetype}). Please upload a JPG, PNG, WebP, GIF, SVG, or AVIF image.`,
    };
  }
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (size > MAX_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds the 10MB limit (uploaded: ${(size / 1024 / 1024).toFixed(1)}MB).`,
    };
  }
  return { valid: true };
}

/**
 * Uploads an image to permanent cloud/database storage
 */
export async function uploadImageToStorage(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<UploadResult> {
  const validation = validateImage(contentType, buffer.length);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const id = `img_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : ".jpg";
  const cleanBase = originalName
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 40);
  const blobPath = `plants/${id}_${cleanBase}${ext}`;

  // 1. Preferred Vercel Storage: Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      logger.info({ blobPath }, "Uploading image to Vercel Blob permanent storage");
      const blob = await put(blobPath, buffer, {
        access: "public",
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      const permanentUrl = blob.url;

      // Also record in database if available
      if (pool) {
        try {
          const client = await pool.connect();
          try {
            await client.query(
              `INSERT INTO uploaded_images (id, file_name, content_type, size, url, storage_provider, data, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
               ON CONFLICT (id) DO UPDATE SET url = $5`,
              [id, originalName, contentType, buffer.length, permanentUrl, "vercel_blob", null]
            );
          } finally {
            client.release();
          }
        } catch (dbErr) {
          logger.warn({ dbErr }, "Could not record blob URL into PostgreSQL; blob itself succeeded");
        }
      }

      return {
        id,
        url: permanentUrl,
        fileName: originalName,
        contentType,
        size: buffer.length,
        storageProvider: "vercel_blob",
      };
    } catch (blobErr) {
      logger.error({ blobErr }, "Failed uploading to Vercel Blob; attempting database storage fallback");
    }
  }

  // 2. Persistent PostgreSQL Database Storage
  const base64Data = buffer.toString("base64");
  const permanentApiUrl = `/api/images/${id}`;

  if (pool) {
    try {
      logger.info({ id }, "Persisting image to PostgreSQL database");
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO uploaded_images (id, file_name, content_type, size, url, storage_provider, data, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (id) DO UPDATE SET url = $5, data = $7, content_type = $3`,
          [id, originalName, contentType, buffer.length, permanentApiUrl, "database", base64Data]
        );
      } finally {
        client.release();
      }

      // Keep in local cache for fastest retrieval
      memoryImageStore.set(id, {
        id,
        fileName: originalName,
        contentType,
        size: buffer.length,
        buffer,
        url: permanentApiUrl,
        storageProvider: "database",
        createdAt: new Date(),
      });

      return {
        id,
        url: permanentApiUrl,
        fileName: originalName,
        contentType,
        size: buffer.length,
        storageProvider: "database",
      };
    } catch (dbErr) {
      logger.error({ dbErr }, "Failed saving image to PostgreSQL; falling back to in-memory store");
    }
  }

  // 3. Fallback Memory Store (for environments without DB or Blob token configured)
  logger.warn({ id }, "Storing image in memory fallback store");
  memoryImageStore.set(id, {
    id,
    fileName: originalName,
    contentType,
    size: buffer.length,
    buffer,
    url: permanentApiUrl,
    storageProvider: "memory_fallback",
    createdAt: new Date(),
  });

  return {
    id,
    url: permanentApiUrl,
    fileName: originalName,
    contentType,
    size: buffer.length,
    storageProvider: "memory_fallback",
  };
}

/**
 * Retrieves an image by ID from persistent storage or database
 */
export async function getImageFromStorage(
  id: string
): Promise<{ buffer: Buffer; contentType: string; fileName: string; size: number } | null> {
  // 1. Check memory cache first
  const cached = memoryImageStore.get(id);
  if (cached) {
    return {
      buffer: cached.buffer,
      contentType: cached.contentType,
      fileName: cached.fileName,
      size: cached.size,
    };
  }

  // 2. Check PostgreSQL database
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT id, file_name, content_type, size, data FROM uploaded_images WHERE id = $1 LIMIT 1`,
          [id]
        );
        if (result.rows.length > 0) {
          const row = result.rows[0];
          if (row.data) {
            const buffer = Buffer.from(row.data, "base64");
            // Cache for subsequent fast hits
            memoryImageStore.set(id, {
              id: row.id,
              fileName: row.file_name,
              contentType: row.content_type,
              size: row.size || buffer.length,
              buffer,
              url: `/api/images/${id}`,
              storageProvider: "database",
              createdAt: new Date(),
            });
            return {
              buffer,
              contentType: row.content_type || "image/jpeg",
              fileName: row.file_name || "image.jpg",
              size: row.size || buffer.length,
            };
          }
        }
      } finally {
        client.release();
      }
    } catch (err) {
      logger.error({ err, id }, "Error retrieving image from database");
    }
  }

  return null;
}
