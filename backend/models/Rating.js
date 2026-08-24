import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "", maxlength: 1000 }
  },
  { timestamps: true }
);

export default mongoose.model("Rating", ratingSchema);
