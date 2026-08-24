import { Router } from "express";
import {
  dashboard,
  getRequests,
  getUsers,
  getTechnicians,
  assignRequest,
  changePriority,
  changeTechnicianStatus,
  makeTechnician,
  changeUserStatus,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.use(authMiddleware, authorizeRoles("admin"));
router.get("/dashboard", dashboard);
router.get("/requests", getRequests);
router.get("/users", getUsers);
router.get("/technicians", getTechnicians);
router.put("/requests/:id/assign", assignRequest);
router.put("/requests/:id/priority", changePriority);
router.put("/technicians/:id/status", changeTechnicianStatus);
router.put("/users/:id/role", makeTechnician);
router.put("/users/:id/status", changeUserStatus);
export default router;
