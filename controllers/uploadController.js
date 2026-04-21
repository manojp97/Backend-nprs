import { sendToPython } from "../services/pythonService.js";
import History from "../models/History.js";

export const uploadImage = async (req, res) => {
  try {
    // ✅ file check
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = req.file.path;

    // ✅ python call
    const result = await sendToPython(filePath);

    if (!result || !result.plate_number) {
      return res.status(500).json({
        message: "OCR failed",
      });
    }

    const plate = result.plate_number || "NOT DETECTED";

    // ✅ save history
    await History.create({
      userId: req.user.id,
      image: req.file.filename,
      plateNumber: plate,
    });

    res.status(200).json({ plate });

  } catch (err) {
    console.error("Upload Error:", err.message);

    res.status(500).json({
      message: "Server error during upload",
    });
  }
};


// ✅ GET HISTORY
export const getHistory = async (req, res) => {
  try {
    const data = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(data);

  } catch (err) {
    console.error("History Error:", err.message);

    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};