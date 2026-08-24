import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import TechnicianProfile from "./models/TechnicianProfile.js";
import ServiceRequest from "./models/ServiceRequest.js";
import Notification from "./models/Notification.js";

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    TechnicianProfile.deleteMany({}),
    ServiceRequest.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const password = async (value) => bcrypt.hash(value, 10);
  const [admin, tech, employee, tech2] = await User.create([
    { name: "Alex Admin", email: "admin@fixmate.local", password: await password("Admin@123"), role: "admin", phone: "9000000001" },
    { name: "Rohan Technician", email: "tech@fixmate.local", password: await password("Tech@123"), role: "technician", phone: "9000000002" },
    { name: "Sara Employee", email: "employee@fixmate.local", password: await password("Employee@123"), role: "employee", phone: "9000000003" },
    { name: "Maya Technician", email: "tech2@fixmate.local", password: await password("Tech@123"), role: "technician", phone: "9000000004" }
  ]);

  await TechnicianProfile.create([
    { userId: tech._id, specialization: "Electrical", experience: 5, availability: "Available", rating: 4.7 },
    { userId: tech2._id, specialization: "IT", experience: 3, availability: "Available", rating: 4.4 }
  ]);

  const [request1, request2] = await ServiceRequest.create([
    {
      title: "Meeting room lights flickering",
      description: "Three ceiling lights are flickering in the main meeting room.",
      category: "Electrical",
      priority: "High",
      status: "ASSIGNED",
      location: "Floor 2 - Meeting Room A",
      createdBy: employee._id,
      assignedTo: tech._id,
      statusHistory: [
        { status: "REPORTED", changedBy: employee._id, note: "Request reported" },
        { status: "ASSIGNED", changedBy: admin._id, note: "Assigned to Rohan Technician" }
      ]
    },
    {
      title: "Laptop cannot connect to Wi-Fi",
      description: "Office laptop repeatedly disconnects from the internal Wi-Fi network.",
      category: "IT",
      priority: "Critical",
      status: "IN_PROGRESS",
      location: "Floor 1 - Finance",
      createdBy: employee._id,
      assignedTo: tech2._id,
      statusHistory: [
        { status: "REPORTED", changedBy: employee._id, note: "Request reported" },
        { status: "ASSIGNED", changedBy: admin._id, note: "Assigned to Maya Technician" },
        { status: "IN_PROGRESS", changedBy: tech2._id, note: "Technician started work" }
      ]
    }
  ]);

  await Notification.create([
    { userId: employee._id, requestId: request1._id, message: `Request "${request1.title}" is assigned to ${tech.name}` },
    { userId: tech._id, requestId: request1._id, message: `You were assigned request "${request1.title}"` },
    { userId: tech2._id, requestId: request2._id, message: `You were assigned request "${request2.title}"` },
    { userId: admin._id, requestId: request1._id, message: `Demo request "${request1.title}" is assigned to ${tech.name}` },
  ]);

  console.log("Seed complete.");
  console.log("Admin: admin@fixmate.local / Admin@123");
  console.log("Tech: tech@fixmate.local / Tech@123");
  console.log("Employee: employee@fixmate.local / Employee@123");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
