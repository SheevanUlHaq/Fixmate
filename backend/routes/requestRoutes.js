import { Router } from "express";
import {
  createRequest, getMyRequests, getRequestById, updateRequest, deleteRequest, closeRequest
} from "../controllers/requestController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = Router();
router.use(authMiddleware);
router.post("/", authorizeRoles("employee"), uploadSingleImage, createRequest);
router.get("/my", authorizeRoles("employee"), getMyRequests);
router.get("/:id", getRequestById);
router.put("/:id", uploadSingleImage, updateRequest);
router.delete("/:id", deleteRequest);
router.put("/:id/close", authorizeRoles("employee"), closeRequest);
export default router;
