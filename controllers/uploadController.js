import axios from "axios";
import fs from "fs";
import History from "../models/History.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = req.file.path;

    const image = fs.readFileSync(filePath, { encoding: "base64" });

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      {
        base64Image: `data:image/jpeg;base64,${image}`,
        language: "eng",
      },
      {
        headers: {
          apikey: "AvGPZAFnvQNOApa7zRncCz",
        },
      }
    );

    // ✅ SAFE CHECK
    if (
      !response.data ||
      !response.data.ParsedResults ||
      response.data.ParsedResults.length === 0
    ) {
      return res.status(500).json({
        message: "OCR API failed",
      });
    }

    const text = response.data.ParsedResults[0].ParsedText || "";

    const cleanText = text.replace(/[^A-Z0-9]/gi, "");

    const plate = cleanText || "NOT DETECTED";

    await History.create({
      userId: req.user.id,
      image: req.file.filename,
      plateNumber: plate,
    });

    res.status(200).json({ plate });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};