import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-nprs.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());

// Static Folder
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running...");
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started On Port ${PORT}`);
});