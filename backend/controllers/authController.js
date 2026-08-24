import bcrypt from "bcryptjs";
import User from "../models/User.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import { generateToken } from "../utils/generateToken.js";
import { success, failure } from "../utils/response.js";
import { notifyAdmins } from "../utils/notifications.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return failure(res, "Name, email and password are required");

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return failure(res, "Email is already registered", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone,
      role: "employee"
    });

    await notifyAdmins(null, `New employee ${user.name} registered`);

    return success(res, "Registration successful", {
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, 201);
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return failure(res, "Invalid email or password", 401);
    }
    if (!user.isActive) return failure(res, "Your account is inactive", 403);

    return success(res, "Login successful", {
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const me = async (req, res) => {
  try {
    const profile =
      req.user.role === "technician"
        ? await TechnicianProfile.findOne({ userId: req.user._id })
        : null;

    return success(res, "Profile loaded", { user: req.user, profile });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};
