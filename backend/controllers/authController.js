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

const createAndSendVerification = async (verification) => {
  const code = String(randomInt(100000, 1000000));
  verification.codeHash = await bcrypt.hash(code, 10);
  verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await verification.save();
  await sendVerificationEmail({ name: verification.name, email: verification.email, code });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return failure(res, "Name, email and password are required");
    const normalizedEmail = email.toLowerCase().trim();
    if (!isCompanyEmail(normalizedEmail)) {
      return failure(res, `Use your company email address (@${companyDomain() || "company domain"})`, 403);
    }

    const [existingUser, pendingVerification] = await Promise.all([
      User.exists({ email: normalizedEmail }),
      EmailVerification.exists({ email: normalizedEmail }),
    ]);
    if (existingUser) return failure(res, "Email is already registered", 409);
    if (pendingVerification) return failure(res, "A verification code is already pending for this email. Use resend code.", 409);

    const hashed = await bcrypt.hash(password, 10);
    const verification = await EmailVerification.create({
      name,
      email: normalizedEmail,
      passwordHash: hashed,
      phone,
      codeHash: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await createAndSendVerification(verification);
    } catch (error) {
      await EmailVerification.deleteOne({ _id: verification._id });
      return failure(res, error.message, 500);
    }

    return success(
      res,
      "Verification code sent to your company email",
      { email: verification.email, expiresAt: verification.expiresAt },
      201,
    );
  } catch (error) {
    return failure(res, error.message, 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) return failure(res, "Email is already verified", 409);
    const verification = await EmailVerification.findOne({ email: normalizedEmail });
    if (!verification || verification.expiresAt <= new Date()) return failure(res, "Verification code has expired. Request a new code.", 400);
    if (!(await bcrypt.compare(String(code || ""), verification.codeHash))) return failure(res, "Invalid verification code", 400);

    const user = await User.create({
      name: verification.name,
      email: verification.email,
      password: verification.passwordHash,
      phone: verification.phone,
      role: "employee",
      emailVerified: true,
      isActive: true,
    });
    await EmailVerification.deleteOne({ _id: verification._id });
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
    if (await User.exists({ email })) return failure(res, "Email is already verified", 409);
    const verification = await EmailVerification.findOne({ email });
    if (!verification) return failure(res, "No pending verification was found for this email", 404);
    await createAndSendVerification(verification);
    return success(res, "A new verification code was sent to your company email", {
      expiresAt: verification.expiresAt,
    });
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
