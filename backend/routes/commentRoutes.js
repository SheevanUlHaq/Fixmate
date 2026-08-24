import { Router } from "express";
import { addComment, getComments } from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);
router.post("/requests/:id/comments", addComment);
router.get("/requests/:id/comments", getComments);
export default router;
