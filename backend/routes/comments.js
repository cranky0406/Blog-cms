import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyCsrfToken } from "../middleware/csrfMiddleware.js";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// PUBLIC — no auth needed
router.get("/:postId", getComments);

// PROTECTED — require JWT + CSRF token
router.post("/:postId",  verifyToken, verifyCsrfToken, addComment);
router.delete("/:id",    verifyToken, verifyCsrfToken, deleteComment);

export default router;
