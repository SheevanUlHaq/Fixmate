import { Router } from "express";
import {
  dashboard, getRequests, updateStatus, resolve, getProfile, updateProfile
} from "../controllers/technicianController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.use(authMiddleware, authorizeRoles("technician"));
router.get("/dashboard", dashboard);
router.get("/requests", getRequests);
router.put("/requests/:id/status", updateStatus);
router.put("/requests/:id/resolve", resolve);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
export default router;
