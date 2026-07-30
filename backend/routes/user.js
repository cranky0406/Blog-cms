import express from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { checkUsername } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyCsrfToken } from "../middleware/csrfMiddleware.js"; // ✅ added

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, verifyCsrfToken, updateProfile); // ✅ CSRF enforced

// Public username availability check
router.get("/check-username", checkUsername);

export default router;
