import Comment from "../models/Comment.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { notify, notifyAdmins } from "../utils/notifications.js";
import { success, failure } from "../utils/response.js";

const canAccess = (request, user) =>
  user.role === "admin" ||
  request.createdBy.toString() === user._id.toString() ||
  request.assignedTo?.toString() === user._id.toString();

export const addComment = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);
    if (!canAccess(request, req.user)) return failure(res, "Forbidden", 403);
    if (!req.body.message?.trim()) return failure(res, "Comment message is required");

    const comment = await Comment.create({
      requestId: request._id,
      userId: req.user._id,
      message: req.body.message.trim()
    });

    const recipients = [request.createdBy, request.assignedTo].filter(Boolean)
      .map(String).filter(id => id !== String(req.user._id));
    for (const id of recipients) await notify(id, request._id, `${req.user.name} commented on "${request.title}"`);
    if (req.user.role !== "admin") {
      await notifyAdmins(request._id, `${req.user.name} commented on "${request.title}"`, req.user._id);
    }

    await comment.populate("userId", "name role");
    return success(res, "Comment added", { comment }, 201);
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getComments = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);
    if (!canAccess(request, req.user)) return failure(res, "Forbidden", 403);

    const comments = await Comment.find({ requestId: request._id })
      .populate("userId", "name role")
      .sort({ createdAt: 1 });
    return success(res, "Comments loaded", { comments });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};
