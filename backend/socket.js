let io;

const initializeSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client Disconnected");
    });
  });
};

const getIO = () => io;

module.exports = {
  initializeSocket,
  getIO,
};