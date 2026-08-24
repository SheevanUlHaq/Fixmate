import ServiceRequest from "../models/ServiceRequest.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import Rating from "../models/Rating.js";
import { addStatusChange, getAssignedStats } from "./requestController.js";
import { notify, notifyAdmins } from "../utils/notifications.js";
import { success, failure } from "../utils/response.js";

export const dashboard = async (req, res) => {
  try {
    const stats = await getAssignedStats(req.user._id);
    const ratings = await Rating.find({
      requestId: { $in: await ServiceRequest.find({ assignedTo: req.user._id }).distinct("_id") }
    });
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    return success(res, "Dashboard loaded", {
      stats: { assigned: Object.values(stats).reduce((a, b) => a + b, 0), ...stats, averageRating: Number(avg.toFixed(1)) }
    });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getRequests = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };
    const requests = await ServiceRequest.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ priority: -1, createdAt: -1 });
    return success(res, "Assigned requests loaded", { requests });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request || request.assignedTo?.toString() !== req.user._id.toString()) return failure(res, "Assigned request not found", 404);

    const { status } = req.body;
    if (!["IN_PROGRESS", "CANCELLED"].includes(status)) return failure(res, "Technician can start work or cancel an assigned request");
    if (!(await addStatusChange(request, req.user, status, `Status changed by ${req.user.name}`))) {
      return failure(res, `Cannot move request from ${request.status} to ${status}`);
    }

    await notify(request.createdBy, request._id, `Request "${request.title}" is now ${status.replace("_", " ")}`);
    await notifyAdmins(request._id, `Technician ${req.user.name} changed "${request.title}" to ${status.replace("_", " ")}`, req.user._id);
    return success(res, "Status updated", { request });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const resolve = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request || request.assignedTo?.toString() !== req.user._id.toString()) return failure(res, "Assigned request not found", 404);

    request.resolution = req.body.resolution?.trim();
    if (!request.resolution) return failure(res, "Resolution notes are required");
    if (!(await addStatusChange(request, req.user, "RESOLVED", "Technician marked the work resolved"))) {
      return failure(res, `Cannot resolve request from ${request.status}`);
    }

    await notify(request.createdBy, request._id, `Request "${request.title}" has been resolved`);
    await notifyAdmins(request._id, `Technician ${req.user.name} resolved "${request.title}"`, req.user._id);
    return success(res, "Request resolved", { request });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({ userId: req.user._id });
    return success(res, "Technician profile loaded", { profile });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        specialization: req.body.specialization,
        experience: Number(req.body.experience || 0),
        availability: req.body.availability
      },
      { new: true, upsert: true, runValidators: true }
    );
    return success(res, "Profile updated", { profile });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};
