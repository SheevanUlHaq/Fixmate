import cloudinary from "../config/cloudinary.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Comment from "../models/Comment.js";
import Rating from "../models/Rating.js";
import Notification from "../models/Notification.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import { notify, notifyAdmins } from "../utils/notifications.js";
import { canTransition } from "../utils/status.js";
import { success, failure } from "../utils/response.js";

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "fixmate/requests", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });

const populateRequest = (query) =>
  query
    .populate("createdBy", "name email phone")
    .populate("assignedTo", "name email phone");

export const createRequest = async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;
    if (!title || !description || !category || !location) {
      return failure(
        res,
        "Title, description, category and location are required",
      );
    }

    const data = {
      title,
      description,
      category,
      priority: priority || "Medium",
      location,
      createdBy: req.user._id,
      statusHistory: [
        {
          status: "REPORTED",
          changedBy: req.user._id,
          note: "Request reported",
        },
      ],
    };

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer);
      data.image = result.secure_url;
      data.imagePublicId = result.public_id;
    }

    const request = await ServiceRequest.create(data);
    await notifyAdmins(request._id, `New ${request.priority.toLowerCase()} priority request: "${request.title}"`);
    return success(res, "Request created successfully", { request }, 201);
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const { search, status, priority, category } = req.query;
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search)
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];

    const requests = await populateRequest(
      ServiceRequest.find(filter).sort({ createdAt: -1 }),
    );
    return success(res, "Requests loaded", { requests });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

const findAccessibleRequest = async (id, user) => {
  const request = await populateRequest(ServiceRequest.findById(id));
  if (!request) return null;
  const allowed =
    user.role === "admin" ||
    request.createdBy?._id.toString() === user._id.toString() ||
    request.assignedTo?._id?.toString() === user._id.toString();
  return allowed ? request : "FORBIDDEN";
};

export const getRequestById = async (req, res) => {
  try {
    const request = await findAccessibleRequest(req.params.id, req.user);
    if (request === "FORBIDDEN")
      return failure(res, "You cannot access this request", 403);
    if (!request) return failure(res, "Request not found", 404);

    const [comments, rating] = await Promise.all([
      Comment.find({ requestId: request._id })
        .populate("userId", "name role")
        .sort({ createdAt: 1 }),
      Rating.findOne({ requestId: request._id }).populate("userId", "name"),
    ]);

    return success(res, "Request loaded", { request, comments, rating });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const updateRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);

    const isOwner = request.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return failure(res, "Forbidden", 403);
    if (request.status !== "REPORTED" && req.user.role !== "admin") {
      return failure(res, "Only reported requests can be edited by employees");
    }

    const { title, description, category, priority, location } = req.body;
    Object.assign(request, {
      title,
      description,
      category,
      priority,
      location,
    });

    if (req.file) {
      if (request.imagePublicId)
        await cloudinary.uploader.destroy(request.imagePublicId);
      const result = await uploadBuffer(req.file.buffer);
      request.image = result.secure_url;
      request.imagePublicId = result.public_id;
    }

    await request.save();
    if (request.assignedTo)
      await notify(
        request.assignedTo,
        request._id,
        `Request "${request.title}" was updated`,
      );
    if (req.user.role !== "admin")
      await notifyAdmins(request._id, `Request "${request.title}" was updated by ${req.user.name}`, req.user._id);
    return success(res, "Request updated successfully", { request });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);

    const owner = request.createdBy.toString() === req.user._id.toString();
    const allowed =
      req.user.role === "admin" || (owner && request.status === "REPORTED");
    if (!allowed) return failure(res, "Request cannot be deleted", 403);

    if (request.imagePublicId)
      await cloudinary.uploader.destroy(request.imagePublicId);
    await Promise.all([
      Comment.deleteMany({ requestId: request._id }),
      Notification.deleteMany({ requestId: request._id }),
      Rating.deleteMany({ requestId: request._id }),
      request.deleteOne(),
    ]);

    return success(res, "Request deleted successfully");
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const closeRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);
    if (request.createdBy.toString() !== req.user._id.toString())
      return failure(res, "Only the employee can close this request", 403);
    if (!canTransition(request.status, "CLOSED"))
      return failure(res, "Only resolved requests can be closed");

    request.status = "CLOSED";
    request.closedAt = new Date();
    request.statusHistory.push({
      status: "CLOSED",
      changedBy: req.user._id,
      note: "Closed by employee",
    });
    await request.save();

    if (request.assignedTo)
      await notify(
        request.assignedTo,
        request._id,
        `Request "${request.title}" was closed`,
      );
    await notifyAdmins(request._id, `Request "${request.title}" was closed by ${req.user.name}`, req.user._id);
    return success(res, "Request closed successfully", { request });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const addStatusChange = async (request, user, status, note = "") => {
  if (!canTransition(request.status, status)) return false;
  request.status = status;
  request.statusHistory.push({ status, changedBy: user._id, note });
  if (status === "RESOLVED") request.resolvedAt = new Date();
  if (status === "CLOSED") request.closedAt = new Date();
  await request.save();
  return true;
};

export const getRequestStatsForUser = async (userId) => {
  const rows = await ServiceRequest.aggregate([
    { $match: { createdBy: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
};

export const getAssignedStats = async (userId) => {
  const rows = await ServiceRequest.aggregate([
    { $match: { assignedTo: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
};
