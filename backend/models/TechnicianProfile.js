import mongoose from "mongoose";

const technicianProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, default: "Other" },
    experience: { type: Number, default: 0, min: 0 },
    availability: {
      type: String,
      enum: ["Available", "Busy", "Offline"],
      default: "Available"
    },
    rating: { type: Number, default: 0, min: 0, max: 5 }
  },
  { timestamps: true }
);

export default mongoose.model("TechnicianProfile", technicianProfileSchema);
