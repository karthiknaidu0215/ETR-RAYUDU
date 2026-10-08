import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { uploadImageToStorage, getImageFromStorage, validateImage } from "../lib/storage.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const check = validateImage(file.mimetype, 0);
    if (!check.valid) {
      cb(new Error(check.error || "Invalid image type"));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload
 * Handles multipart file upload OR json base64 data URL upload
 */
router.post(
  "/upload",
  (req: Request, res: Response, next) => {
    // If multipart/form-data, use multer
    if (req.is("multipart/form-data")) {
      upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({
              error: "File size limit exceeded. Maximum allowed size is 10MB.",
            });
            return;
          }
          res.status(400).json({ error: err.message });
          return;
        } else if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        next();
      });
    } else {
      next();
    }
  },
  async (req: Request, res: Response) => {
    try {
      let buffer: Buffer;
      let originalName = "upload.jpg";
      let contentType = "image/jpeg";

      // 1. Check if multipart file uploaded
      if (req.file) {
        buffer = req.file.buffer;
        originalName = req.file.originalname || "image.jpg";
        contentType = req.file.mimetype || "image/jpeg";
      }
      // 2. Check if JSON payload with base64 data URL
      else if (req.body?.image && typeof req.body.image === "string") {
        const dataUrl = req.body.image;
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
          originalName = req.body.fileName || `upload_${Date.now()}.${contentType.split("/")[1] || "jpg"}`;
        } else {
          return res.status(400).json({
            error: "Invalid image format. Provide a valid base64 data URL (e.g. data:image/jpeg;base64,...) or multipart file.",
          });
        }
      } else {
        return res.status(400).json({
          error: "No image file provided in request. Submit 'file' field or JSON 'image' base64 data URL.",
        });
      }

      logger.info(
        { originalName, contentType, size: buffer.length },
        "Processing image upload request"
      );

      const result = await uploadImageToStorage(buffer, originalName, contentType);

      return res.status(200).json({
        success: true,
        url: result.url,
        id: result.id,
        fileName: result.fileName,
        contentType: result.contentType,
        size: result.size,
        storageProvider: result.storageProvider,
      });
    } catch (err: any) {
      logger.error({ err }, "Image upload error");
      return res.status(500).json({
        error: err.message || "Failed to process and store image",
      });
    }
  }
);

/**
 * GET /api/images/:id
 * Streams the permanently stored image
 */
router.get("/images/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      res.status(400).send("Image ID is required");
      return;
    }

    const image = await getImageFromStorage(id);
    if (!image) {
      return res.status(404).send("Image not found");
    }

    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Content-Length", image.size);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(image.fileName)}"`);

    return res.status(200).send(image.buffer);
  } catch (err: any) {
    logger.error({ err }, "Error serving image");
    return res.status(500).send("Error serving image");
  }
});

export default router;
