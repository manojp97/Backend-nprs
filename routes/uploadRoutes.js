import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadImage, getHistory } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", protect, upload.single("image"), uploadImage);
router.get("/history", protect, getHistory);

export default router;