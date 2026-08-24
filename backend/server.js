import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morgan("dev"));

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "FixMate API is running" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", ratingRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`FixMate API listening on port ${PORT}`));
});
