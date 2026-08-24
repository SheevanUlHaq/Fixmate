import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

commentSchema.index({ requestId: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
