import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["Electrical", "Plumbing", "IT", "Cleaning", "Furniture", "HVAC", "Other"],
      required: true
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"],
      default: "REPORTED"
    },
    location: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolution: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    statusHistory: { type: [historySchema], default: [] }
  },
  { timestamps: true }
);

serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ category: 1 });
serviceRequestSchema.index({ createdBy: 1 });
serviceRequestSchema.index({ assignedTo: 1 });

export default mongoose.model("ServiceRequest", serviceRequestSchema);
