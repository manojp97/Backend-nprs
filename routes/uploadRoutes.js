// routes/uploadRoutes.js

import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadImage,
  getHistory,
  deleteHistory
} from "../controllers/uploadController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Upload
router.post("/upload", protect, upload.single("image"), uploadImage);

// Get History
router.get("/history", protect, getHistory);

// Delete History
router.delete("/history/:id", protect, deleteHistory);

export default router;