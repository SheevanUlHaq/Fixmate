import { Router } from "express";
import { addRating, getRating } from "../controllers/ratingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);
router.post("/requests/:id/rating", addRating);
router.get("/requests/:id/rating", getRating);
export default router;
