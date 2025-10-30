import express from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../middleware/auth";
import { LocalFileService } from "../services/localFileService";
import { prisma } from "../lib/prisma";
import {
  compressPDF,
  checkGhostscriptAvailability,
} from "../utils/pdfCompressor";

const router = express.Router();
const fileService = LocalFileService.getInstance();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Only allow PDF files
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
  },
});

// Upload PDF file locally (admin only)
router.post(
  "/pdf",
  authenticateToken,
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Check if compression is requested (default: true for files > 2MB)
      const shouldCompress =
        req.body.compress !== "false" || req.file.size > 2 * 1024 * 1024;

      // Check if Ghostscript is available for compression
      const ghostscriptAvailable = await checkGhostscriptAvailability();

      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname);
      const fileName = `${req.file.fieldname}-${uniqueSuffix}${ext}`;

      // If compression is disabled, not available, or file is small, upload directly
      if (!shouldCompress || !ghostscriptAvailable) {
        const localFile = await fileService.uploadPDF(
          req.file.buffer,
          fileName,
          req.file.originalname
        );

        const message = !ghostscriptAvailable
          ? "File uploaded successfully (Ghostscript not available for compression)"
          : "File uploaded successfully (no compression)";

        res.json({
          message,
          fileId: localFile.id,
          fileName: localFile.name,
          originalName: req.file.originalname,
          size: localFile.size,
          url: localFile.url,
          filePath: localFile.filePath,
          // Add compatibility fields for existing frontend
          viewingUrl: localFile.url,
          embeddedUrl: localFile.url,
        });
        return;
      }

      // First, save the original file temporarily
      const tempFile = await fileService.uploadPDF(
        req.file.buffer,
        `temp-${fileName}`,
        req.file.originalname
      );

      try {
        // Compress the PDF
        const compressedFileName = `compressed-${fileName}`;
        const compressedFilePath = path.join(
          path.dirname(tempFile.filePath),
          compressedFileName
        );

        const compressionResult = await compressPDF(
          tempFile.filePath,
          compressedFilePath
        );

        if (!compressionResult.success) {
          throw new Error(compressionResult.error || "Compression failed");
        }

        // Read the compressed file
        const fs = require("fs").promises;
        const compressedBuffer = await fs.readFile(compressedFilePath);

        // Save the compressed file with the final name
        const finalFile = await fileService.uploadPDF(
          compressedBuffer,
          fileName,
          req.file.originalname
        );

        // Clean up temporary files
        await fileService.deleteFile(tempFile.filePath);
        await fs.unlink(compressedFilePath);

        console.log(
          `PDF compressed: Original size: ${compressionResult.originalSize} bytes, Compressed size: ${compressionResult.compressedSize} bytes, Ratio: ${compressionResult.compressionRatio}%`
        );

        res.json({
          message: "File uploaded and compressed successfully",
          fileId: finalFile.id,
          fileName: finalFile.name,
          originalName: req.file.originalname,
          size: finalFile.size,
          originalSize: compressionResult.originalSize.toString(),
          compressionRatio: `${compressionResult.compressionRatio}%`,
          url: finalFile.url,
          filePath: finalFile.filePath,
          // Add compatibility fields for existing frontend
          viewingUrl: finalFile.url,
          embeddedUrl: finalFile.url,
        });
      } catch (compressionError) {
        console.warn(
          "PDF compression failed, using original file:",
          compressionError
        );

        // If compression fails, use the original file
        res.json({
          message:
            "File uploaded successfully (compression failed, using original)",
          fileId: tempFile.id,
          fileName: tempFile.name,
          originalName: req.file.originalname,
          size: tempFile.size,
          url: tempFile.url,
          filePath: tempFile.filePath,
          // Add compatibility fields for existing frontend
          viewingUrl: tempFile.url,
          embeddedUrl: tempFile.url,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  }
);

// Delete file locally (admin only)
router.delete("/pdf/:fileId", authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Delete locally (fileId in this case is the filename or path)
    await fileService.deleteFile(fileId);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "File deletion failed" });
  }
});

// Get file info locally (admin only)
router.get("/pdf/:fileId", authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileInfo = await fileService.getFileInfo(fileId);

    if (!fileInfo) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(fileInfo);
  } catch (error) {
    console.error("Get file info error:", error);
    res.status(500).json({ error: "Failed to get file info" });
  }
});

// List all uploaded files (admin only)
router.get("/files", authenticateToken, async (req, res) => {
  try {
    const files = await fileService.listFiles();
    res.json({ files });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Check Ghostscript availability for PDF compression
router.get("/compression-status", authenticateToken, async (req, res) => {
  try {
    const isAvailable = await checkGhostscriptAvailability();
    res.json({
      ghostscriptAvailable: isAvailable,
      compressionEnabled: isAvailable,
      message: isAvailable
        ? "PDF compression is available and enabled"
        : "PDF compression is disabled - Ghostscript not found",
    });
  } catch (error) {
    console.error("Compression status check error:", error);
    res.status(500).json({
      ghostscriptAvailable: false,
      compressionEnabled: false,
      error: "Failed to check compression status",
    });
  }
});

export default router;
