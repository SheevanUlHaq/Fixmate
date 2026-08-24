import Rating from "../models/Rating.js";
import ServiceRequest from "../models/ServiceRequest.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import { success, failure } from "../utils/response.js";

export const addRating = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);
    if (request.createdBy.toString() !== req.user._id.toString()) return failure(res, "Only the employee can rate this request", 403);
    if (!["RESOLVED", "CLOSED"].includes(request.status)) return failure(res, "Request must be resolved or closed before rating");
    if (!request.assignedTo) return failure(res, "No technician is assigned");

    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return failure(res, "Rating must be an integer from 1 to 5");

    const exists = await Rating.findOne({ requestId: request._id });
    if (exists) return failure(res, "This request has already been rated", 409);

    const created = await Rating.create({
      requestId: request._id,
      userId: req.user._id,
      rating,
      review: req.body.review || ""
    });

    const all = await Rating.find({
      requestId: { $in: await ServiceRequest.find({ assignedTo: request.assignedTo }).distinct("_id") }
    });
    const avg = all.length ? all.reduce((sum, item) => sum + item.rating, 0) / all.length : 0;
    await TechnicianProfile.findOneAndUpdate(
      { userId: request.assignedTo },
      { rating: Number(avg.toFixed(1)) }
    );

    return success(res, "Rating submitted", { rating: created }, 201);
  } catch (error) {
    if (error.code === 11000) return failure(res, "This request has already been rated", 409);
    return failure(res, error.message, 500);
  }
};

export const getRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ requestId: req.params.id }).populate("userId", "name");
    return success(res, "Rating loaded", { rating });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};
