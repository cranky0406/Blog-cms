import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import cookieParser from "cookie-parser";
import postRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import path from "path";
import uploadRoutes from "./routes/upload.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();

const app = express();

// middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://blogcms-frontend.netlify.app",
  "https://blog-cms-one-puce.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS for all routes without registering a path pattern
// (some router/path-to-regexp versions error on '*' patterns in production).
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// serve uploaded files
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

// comment routes
app.use("/api/comments", commentRoutes);

// user profile routes
app.use("/api/users", userRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

// DB connection
console.log("Server starting...");

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
