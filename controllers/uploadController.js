import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import History from "../models/History.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
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

    const result = response.data.results[0];

    if (!result) {
      return res.status(200).json({
        message: "No Plate Found",
      });
    }

    const plate = result.plate.toUpperCase();

    await History.create({
      userId: req.user.id,
      image: req.file.filename,
      plateNumber: plate,
    });

    res.status(200).json({
      plate,
      confidence: result.score,
      vehicle: result.vehicle,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      message: "Recognition Failed",
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const data = await History.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};