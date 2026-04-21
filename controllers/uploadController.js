import axios from "axios";
import fs from "fs";
import History from "../models/History.js";

export const uploadImage = async (req, res) => {
  try {
    // ✅ file check
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = req.file.path;

    // 🔥 image ko base64 me convert
    const image = fs.readFileSync(filePath, { encoding: "base64" });

    // 🔥 OCR API call
    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      {
        base64Image: `data:image/jpeg;base64,${image}`,
        language: "eng",
      },
      {
        headers: {
          apikey: "AvGPZAFnvQNOApa7zRncCz", // free key
        },
      }
    );

    // 🔥 text extract
    const text = response.data.ParsedResults?.[0]?.ParsedText || "";

    // 🔥 clean plate number
    const cleanText = text.replace(/[^A-Z0-9]/gi, "");

    const plate = cleanText || "NOT DETECTED";

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
      message: "OCR failed",
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