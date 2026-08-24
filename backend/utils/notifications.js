import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const notify = async (userId, requestId, message) => {
  if (!userId || !message) return null;
  return Notification.create({ userId, requestId: requestId || null, message });
};

export const notifyAdmins = async (requestId, message, excludeUserId = null) => {
  const filter = { role: "admin", isActive: true };
  if (excludeUserId) filter._id = { $ne: excludeUserId };
  const admins = await User.find(filter).select("_id").lean();
  if (!admins.length) return [];
  return Notification.insertMany(
    admins.map((admin) => ({
      userId: admin._id,
      requestId: requestId || null,
      message,
    })),
  );
};

export const notifyUsers = async (userIds, requestId, message, excludeUserId = null) => {
  const ids = [...new Set((userIds || []).filter(Boolean).map(String))].filter(
    (id) => !excludeUserId || id !== String(excludeUserId),
  );
  if (!ids.length || !message) return [];
  return Notification.insertMany(
    ids.map((userId) => ({ userId, requestId: requestId || null, message })),
  );
};
