import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://constructai-backend-ikqh.onrender.com" : "http://localhost:5001");

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"]
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("⚠️ Socket Disconnected:", reason);
});

export default socket;