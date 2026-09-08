import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import TechnicianProfile from "./models/TechnicianProfile.js";
import ServiceRequest from "./models/ServiceRequest.js";
import Notification from "./models/Notification.js";
import Comment from "./models/Comment.js";
import Rating from "./models/Rating.js";
import EmailVerification from "./models/EmailVerification.js";

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    TechnicianProfile.deleteMany({}),
    ServiceRequest.deleteMany({}),
    Notification.deleteMany({}),
    Comment.deleteMany({}),
    Rating.deleteMany({}),
    EmailVerification.deleteMany({}),
  ]);

  const password = async (value) => bcrypt.hash(value, 10);
  const [admin, admin2, tech, tech2, tech3, employee, employee2, employee3] =
    await User.create([
      {
        name: "Sheevan Admin",
        email: "sheevan.admin@fixmate.com",
        password: await password("Admin@123"),
        role: "admin",
        phone: "9000000001",
        emailVerified: true,
      },
      {
        name: "Sheebu Admin",
        email: "sheebu.admin@fixmate.com",
        password: await password("Admin@123"),
        role: "admin",
        phone: "9000000002",
        emailVerified: true,
      },
      {
        name: "Rohan Technician",
        email: "rohan.tech@fixmate.com",
        password: await password("Tech@123"),
        role: "technician",
        phone: "9000000003",
        emailVerified: true,
      },
      {
        name: "Maya Technician",
        email: "maya.tech@fixmate.com",
        password: await password("Tech@123"),
        role: "technician",
        phone: "9000000004",
        emailVerified: true,
      },
      {
        name: "Arjun Technician",
        email: "arjun.tech@fixmate.com",
        password: await password("Tech@123"),
        role: "technician",
        phone: "9000000005",
        emailVerified: true,
      },
      {
        name: "Sara Employee",
        email: "sara@fixmate.com",
        password: await password("Employee@123"),
        role: "employee",
        phone: "9000000006",
        emailVerified: true,
      },
      {
        name: "Vikram Employee",
        email: "vikram@fixmate.com",
        password: await password("Employee@123"),
        role: "employee",
        phone: "9000000007",
        emailVerified: true,
      },
      {
        name: "Ananya Employee",
        email: "ananya@fixmate.com",
        password: await password("Employee@123"),
        role: "employee",
        phone: "9000000008",
        emailVerified: true,
      },
    ]);

  await TechnicianProfile.create([
    {
      userId: tech._id,
      specialization: "Electrical",
      experience: 5,
      availability: "Available",
      rating: 4.7,
    },
    {
      userId: tech2._id,
      specialization: "IT",
      experience: 3,
      availability: "Available",
      rating: 4.4,
    },
    {
      userId: tech3._id,
      specialization: "HVAC",
      experience: 6,
      availability: "Available",
      rating: 4.9,
    },
  ]);

  const [request1, request2] = await ServiceRequest.create([
    {
      title: "Meeting room lights flickering",
      description:
        "Three ceiling lights are flickering in the main meeting room.",
      category: "Electrical",
      priority: "High",
      status: "ASSIGNED",
      location: "Floor 2 - Meeting Room A",
      createdBy: employee._id,
      assignedTo: tech._id,
      statusHistory: [
        {
          status: "REPORTED",
          changedBy: employee._id,
          note: "Request reported",
        },
        {
          status: "ASSIGNED",
          changedBy: admin._id,
          note: "Assigned to Rohan Technician",
        },
      ],
    },
    {
      title: "Laptop cannot connect to Wi-Fi",
      description:
        "Office laptop repeatedly disconnects from the internal Wi-Fi network.",
      category: "IT",
      priority: "Critical",
      status: "IN_PROGRESS",
      location: "Floor 1 - Finance",
      createdBy: employee._id,
      assignedTo: tech2._id,
      statusHistory: [
        {
          status: "REPORTED",
          changedBy: employee._id,
          note: "Request reported",
        },
        {
          status: "ASSIGNED",
          changedBy: admin._id,
          note: "Assigned to Maya Technician",
        },
        {
          status: "IN_PROGRESS",
          changedBy: tech2._id,
          note: "Technician started work",
        },
      ],
    },
  ]);

  await Notification.create([
    {
      userId: employee._id,
      requestId: request1._id,
      message: `Request "${request1.title}" is assigned to ${tech.name}`,
    },
    {
      userId: tech._id,
      requestId: request1._id,
      message: `You were assigned request "${request1.title}"`,
    },
    {
      userId: tech2._id,
      requestId: request2._id,
      message: `You were assigned request "${request2.title}"`,
    },
    {
      userId: admin._id,
      requestId: request1._id,
      message: `Demo request "${request1.title}" is assigned to ${tech.name}`,
    },
  ]);

  console.log("Seed complete.");
  console.log(
    "Admins: Sheevan.admin@fixmate.com, Sheebu.admin@fixmate.com / Admin@123",
  );
  console.log(
    "Technicians: rohan.tech@fixmate.com, maya.tech@fixmate.com, arjun.tech@fixmate.com / Tech@123",
  );
  console.log(
    "Employees: sara@fixmate.com, vikram@fixmate.com, ananya@fixmate.com / Employee@123",
  );
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
