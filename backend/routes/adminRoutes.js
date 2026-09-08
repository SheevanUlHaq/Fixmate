import { Router } from "express";
import {
  dashboard,
  getRequests,
  getEmployees,
  getTechnicians,
  createTechnician,
  assignRequest,
  changePriority,
  changeTechnicianStatus,
  changeEmployeeStatus,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.use(authMiddleware, authorizeRoles("admin"));
router.get("/dashboard", dashboard);
router.get("/requests", getRequests);
router.get("/employees", getEmployees);
router.get("/technicians", getTechnicians);
router.post("/technicians", createTechnician);
router.put("/requests/:id/assign", assignRequest);
router.put("/requests/:id/priority", changePriority);
router.put("/technicians/:id/status", changeTechnicianStatus);
router.put("/employees/:id/status", changeEmployeeStatus);
export default router;
