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
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);


app.use("/api/auth", authRoutes);

const connectDB = require("./config/db");
connectDB();
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});