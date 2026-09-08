import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import User from "../models/User.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import EmailVerification from "../models/EmailVerification.js";
import { generateToken } from "../utils/generateToken.js";
import { success, failure } from "../utils/response.js";
import { notifyAdmins } from "../utils/notifications.js";
import { sendVerificationEmail } from "../utils/email.js";

const companyDomain = () => process.env.COMPANY_EMAIL_DOMAIN?.trim().toLowerCase();

const isCompanyEmail = (email) => {
  const domain = companyDomain();
  return domain && email.endsWith(`@${domain}`);
};

const createAndSendVerification = async (user) => {
  const code = String(randomInt(100000, 1000000));
  await EmailVerification.findOneAndUpdate(
    { userId: user._id },
    { codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await sendVerificationEmail({ name: user.name, email: user.email, code });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return failure(res, "Name, email and password are required");
    const normalizedEmail = email.toLowerCase().trim();
    if (!isCompanyEmail(normalizedEmail)) {
      return failure(res, `Use your company email address (@${companyDomain() || "company domain"})`, 403);
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return failure(res, "Email is already registered", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      phone,
      role: "employee",
      emailVerified: false,
      isActive: false,
    });

    try {
      await createAndSendVerification(user);
    } catch (error) {
      await Promise.all([EmailVerification.deleteOne({ userId: user._id }), User.deleteOne({ _id: user._id })]);
      return failure(res, error.message, 500);
    }

    return success(res, "Verification code sent to your company email", { email: user.email }, 201);
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim(), role: "employee" }).select("+password");
    if (!user) return failure(res, "Employee account not found", 404);
    if (user.emailVerified) return failure(res, "Email is already verified", 409);

    const verification = await EmailVerification.findOne({ userId: user._id });
    if (!verification || verification.expiresAt <= new Date()) return failure(res, "Verification code has expired. Request a new code.", 400);
    if (!(await bcrypt.compare(String(code || ""), verification.codeHash))) return failure(res, "Invalid verification code", 400);

    user.emailVerified = true;
    user.isActive = true;
    await Promise.all([user.save(), EmailVerification.deleteOne({ _id: verification._id })]);
    await notifyAdmins(null, `New employee ${user.name} verified their company email`);

    return success(res, "Email verified. Your employee account is active.", {
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const resendVerification = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const user = await User.findOne({ email, role: "employee" });
    if (!user) return failure(res, "Employee account not found", 404);
    if (user.emailVerified) return failure(res, "Email is already verified", 409);
    await createAndSendVerification(user);
    return success(res, "A new verification code was sent to your company email");
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
    if (!user.emailVerified) return failure(res, "Verify your email before signing in", 403);
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
