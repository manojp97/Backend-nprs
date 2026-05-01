import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import History from "../models/History.js";

// FIXED Plate Recognizer API
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = req.file.path;

    const formData = new FormData();
    formData.append("upload", fs.createReadStream(filePath));

    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Token ${process.env.PLATE_API_KEY}`,
        },
      }
    );

    const results = response.data.results;

    if (!results || results.length === 0) {
      return res.json({ plate: "NOT DETECTED" });
    }

    const plate = results[0].plate.toUpperCase();

    await History.create({
      userId: req.user.id,
      image: req.file.filename,
      plateNumber: plate,
    });

    res.json({
      plate,
      confidence: results[0].score,
    });

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    res.status(500).json({
      message: "Recognition Failed",
    });
  }
};

// HISTORY
export const getHistory = async (req, res) => {
  try {
    const data = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};