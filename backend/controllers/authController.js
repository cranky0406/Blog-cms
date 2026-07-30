import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { checkPurchase } from "../services/courseService.js";

// VERIFY PURCHASE (used by frontend "Verify" button)
export const verifyPurchase = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });
    // Check if phone already exists in our users table (registered)
    let registered = false;
    try {
      const r = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
      registered = r.rowCount > 0;
    } catch (dbErr) {
      console.error("DB check error in verifyPurchase:", dbErr?.message || dbErr);
      // we continue — registration check is best-effort
    }

    try {
      const purchase = await checkPurchase(phone);
      // return course-service result plus whether phone is already registered
      return res.json({ ...purchase, registered });
    } catch (err) {
      // If course service is unavailable, still return registered info when possible
      if (err && err.code === "SERVICE_UNAVAILABLE") {
        return res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: "Course service unavailable", registered });
      }

      console.error("verifyPurchase error:", err?.response?.data || err?.message || err);
      return res.status(500).json({ error: "VERIFY_FAILED", registered });
    }
  } catch (err) {
    if (err && err.code === "SERVICE_UNAVAILABLE") {
      return res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: "Course service unavailable" });
    }
    console.error("verifyPurchase error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ error: "VERIFY_FAILED" });
  }
};
// ✅ Single shared cookie config — must be identical when setting AND clearing
// Without maxAge, the browser treats it as a session cookie and drops it
// on cross-site navigation (Vercel → Railway)
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, username } = req.body;

    // basic validations
    if (!phone) return res.status(400).json({ message: "Phone is required" });
    if (!username) return res.status(400).json({ message: "Username is required" });

    // Email presence and domain restriction
    if (!email) return res.status(400).json({ message: "Email is required" });
    const normalizedEmail = String(email).toLowerCase();
    if (!normalizedEmail.endsWith("@uxism.org")) {
      return res.status(400).json({ message: "Only @uxism.org email addresses are allowed." });
    }

    // Prevent duplicate phone registrations
    const existingPhone = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existingPhone.rowCount > 0) {
      return res.status(409).json({ message: "Phone already registered. Please login or use a different phone number." });
    }

    // 1) Verify purchase via Course Service
    try {
      const purchase = await checkPurchase(phone);
      if (!purchase || !purchase.exists || purchase.status !== "active") {
        return res.status(403).json({
          error: "PURCHASE_REQUIRED",
          message: "Please purchase a UXISM course first.",
        });
      }
    } catch (err) {
      if (err && err.code === "SERVICE_UNAVAILABLE") {
        return res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: "Course service unavailable" });
      }

      console.error("Course service error:", err?.response?.data || err?.message || err);
      return res.status(500).json({ error: "SIGNUP_FAILED" });
    }

    // 1.5) Check username & email uniqueness
    const existingUsername = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existingUsername.rowCount > 0) return res.status(409).json({ message: "Username already exists" });

    const existingEmail = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existingEmail.rowCount > 0) return res.status(409).json({ message: "Email already registered. Please login." });

    // 2) Proceed with user creation
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, username, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, normalizedEmail, hashedPassword, username, phone]
    );
    const newUser = result.rows[0];
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    console.log("Signup Error:", err?.message || err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;

    res.cookie("token", token, COOKIE_OPTIONS).json({ user: safeUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// LOGOUT
export const logout = (req, res) => {
  // ✅ clearCookie must use the same options as when the cookie was set
  res.clearCookie("token", COOKIE_OPTIONS).json({ message: "Logged out" });
};

// GET CURRENT USER
export const getMe = (req, res) => {
  res.json({ user: req.user });
};
