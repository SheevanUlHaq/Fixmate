import nodemailer from "nodemailer";

const smtpConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = () => {
  if (!smtpConfigured()) throw new Error("Email service is not configured");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

export const sendVerificationEmail = async ({ name, email, code }) => {
  await transporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Verify your FixMate employee account",
    text: `Hello ${name},\n\nYour FixMate verification code is ${code}. It expires in 10 minutes.\n\nIf you did not request this account, you can ignore this email.`,
  });
};
