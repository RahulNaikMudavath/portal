const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const testRoutes = require("./modules/auth/routes/testRoutes");
require("dotenv").config();

const app = express();

app.use((req, res, next) => {
    console.log("=================================");
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("HEADERS:", req.headers);
    next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
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

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/test", testRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
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

const connectDB = require("./config/db");
connectDB();
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); // nodemon trigger