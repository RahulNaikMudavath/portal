const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorMiddleware");
require("dotenv").config();

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5001"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation: Origin not allowed"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again after 15 minutes" }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 minutes for general API
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api", apiLimiter);

// Sanitized Request Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${req.method}] ${req.originalUrl}`);
  }
  next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    credentials: true
  }
});

// make io globally accessible
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (userId) => {
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const { sanitizeInput } = require("./middleware/sanitizeMiddleware");
const mongoose = require("mongoose");

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// NoSQL injection protection
app.use(sanitizeInput);

app.get("/", (req, res) => {
  res.send("API Running");
});

// Uptime & System Health Check
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" }[dbState] || "unknown";

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    version: "1.0.0"
  });
});

const authRoutes = require("./modules/auth/routes/authRoutes");
const taskRoutes = require("./modules/tasks/routes/taskRoutes");
const userRoutes = require("./modules/users/routes/userRoutes");
const notificationRoutes = require("./modules/notifications/routes/notificationRoutes");
const commentRoutes = require("./modules/comments/routes/commentRoutes");  
const analyticsRoutes = require("./modules/analytics/routes/analyticsRoutes");
const workRequestRoutes = require("./modules/workrequests/routes/workRequestRoutes");
const workOrderRoutes = require("./modules/workorders/routes/workOrderRoutes");
const engineerRoutes = require("./modules/engineers/routes/engineerRoutes");
const whatsappRoutes = require("./modules/whatsapp/routes/whatsappRoutes");
const projectRoutes = require("./modules/projects/routes/projectRoutes");
const documentRoutes = require("./modules/documents/routes/documentRoutes");
const calendarRoutes = require("./modules/calendar/routes/calendarRoutes");

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/workorders", workOrderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/workrequests", workRequestRoutes);
app.use("/api/engineer", engineerRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/auth", authRoutes);

// Global Error Handler
app.use(errorHandler);

const connectDB = require("./config/db");
connectDB();
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});