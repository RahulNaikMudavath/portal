const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const testRoutes = require("./routes/testRoutes");
require("dotenv").config();

const app = express();
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
app.use(express.json());
app.use("/api/test", testRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const commentRoutes = require("./routes/commentRoutes");  
const analyticsRoutes = require("./routes/analyticsRoutes");
const workRequestRoutes = require("./routes/workRequestRoutes");
const workOrderRoutes = require("./routes/workOrderRoutes");
const engineerRoutes = require("./routes/engineerRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const projectRoutes = require("./routes/projectRoutes");
const documentRoutes = require("./routes/documentRoutes");
const calendarRoutes = require("./routes/calendarRoutes");


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