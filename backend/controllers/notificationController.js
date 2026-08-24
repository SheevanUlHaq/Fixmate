import Notification from "../models/Notification.js";
import { success, failure } from "../utils/response.js";

export const getNotifications = async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .populate("requestId", "title status")
        .sort({ createdAt: -1 })
        .limit(50),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    return success(res, "Notifications loaded", { notifications, unreadCount });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return failure(res, "Notification not found", 404);
    return success(res, "Notification marked as read", { notification });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return success(res, "All notifications marked as read");
  } catch (error) {
    return failure(res, error.message, 500);
  }
};
