import ServiceRequest from "../models/ServiceRequest.js";
import User from "../models/User.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import { notify } from "../utils/notifications.js";
import { addStatusChange } from "./requestController.js";
import { success, failure } from "../utils/response.js";

const counts = async (field, match = {}) =>
  ServiceRequest.aggregate([
    { $match: match },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);

export const dashboard = async (req, res) => {
  try {
    const [status, category, priority, technicians] = await Promise.all([
      counts("status"),
      counts("category"),
      counts("priority"),
      User.aggregate([
        { $match: { role: "technician" } },
        {
          $lookup: {
            from: "servicerequests",
            localField: "_id",
            foreignField: "assignedTo",
            as: "requests",
          },
        },
        {
          $project: {
            name: 1,
            active: "$isActive",
            assigned: { $size: "$requests" },
          },
        },
        { $sort: { assigned: -1 } },
      ]),
    ]);
    return success(res, "Admin dashboard loaded", {
      status,
      category,
      priority,
      technicians,
      totalRequests: await ServiceRequest.countDocuments(),
      criticalRequests: await ServiceRequest.countDocuments({
        priority: "Critical",
      }),
    });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getRequests = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      technician,
      page = 1,
      limit = 12,
      sort = "-createdAt",
    } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (technician) filter.assignedTo = technician;
    if (search)
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      ServiceRequest.countDocuments(filter),
    ]);

    return success(res, "Admin requests loaded", {
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return success(res, "Users loaded", { users });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.aggregate([
      { $match: { role: "technician" } },
      {
        $lookup: {
          from: "technicianprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $lookup: {
          from: "servicerequests",
          localField: "_id",
          foreignField: "assignedTo",
          as: "requests",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          isActive: 1,
          profile: { $arrayElemAt: ["$profile", 0] },
          assignedRequests: { $size: "$requests" },
          resolvedRequests: {
            $size: {
              $filter: {
                input: "$requests",
                as: "r",
                cond: { $eq: ["$$r.status", "RESOLVED"] },
              },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);
    return success(res, "Technicians loaded", { technicians });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const assignRequest = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const technician = await User.findOne({
      _id: technicianId,
      role: "technician",
      isActive: true,
    });
    if (!technician) return failure(res, "Active technician not found", 404);

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return failure(res, "Request not found", 404);

    const previousTechnicianId = request.assignedTo;
    request.assignedTo = technician._id;
    if (request.status === "REPORTED") {
      await addStatusChange(
        request,
        req.user,
        "ASSIGNED",
        `Assigned to ${technician.name}`,
      );
    } else {
      await request.save();
    }

    await notify(
      technician._id,
      request._id,
      `You were assigned request "${request.title}"`,
    );
    if (previousTechnicianId && String(previousTechnicianId) !== String(technician._id)) {
      await notify(previousTechnicianId, request._id, `Request "${request.title}" was reassigned to ${technician.name}`);
    }
    await notify(
      request.createdBy,
      request._id,
      `Request "${request.title}" was assigned to ${technician.name}`,
    );

    return success(res, "Technician assigned", { request });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const changePriority = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true, runValidators: true },
    );
    if (!request) return failure(res, "Request not found", 404);
    if (request.assignedTo)
      await notify(
        request.assignedTo,
        request._id,
        `Priority for "${request.title}" changed to ${request.priority}`,
      );
    await notify(request.createdBy, request._id, `Priority for "${request.title}" changed to ${request.priority}`);
    return success(res, "Priority updated", { request });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const changeTechnicianStatus = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "technician" },
      { isActive: req.body.isActive },
      { new: true },
    ).select("-password");
    if (!user) return failure(res, "Technician not found", 404);
    if (user.isActive) {
      await notify(user._id, null, "Your technician account has been activated by an administrator");
    }
    return success(res, "Technician status updated", { user });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const changeUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: { $ne: "admin" } });
    if (!user) return failure(res, "User not found", 404);

    user.isActive = Boolean(req.body.isActive);
    await user.save();

    if (user.isActive) {
      await notify(user._id, null, "Your FixMate account has been activated by an administrator");
    }

    return success(res, "User status updated", { user: user.toObject({ transform: (_, ret) => { delete ret.password; return ret; } }) });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const makeTechnician = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return failure(res, "User not found", 404);
    if (user.role === "admin")
      return failure(res, "Cannot change an admin's role", 400);

    user.role = "technician";
    await user.save();

    const existing = await TechnicianProfile.findOne({ userId: user._id });
    if (!existing) {
      await TechnicianProfile.create({ userId: user._id });
    }

    await notify(user._id, null, "Your FixMate account has been promoted to technician");
    return success(res, "User promoted to technician", { user });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};
