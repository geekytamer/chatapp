import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser()); // Parse cookies from request headers
app.use(express.json({ limit: "50mb" })); // Parse JSON request bodies
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const server = http.createServer(app);
server.setTimeout(20 * 60 * 1000);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3011",
      "https://mll116rk-3011.asse.devtunnels.ms",
    ], // Add both origins here
    methods: ["GET", "POST"],
    credentials: true, // Include this if you need cookies or other credentials
  },
});
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
const userSocketMap = {}; //{userId: socketId}
io.on("connection", (socket) => {
  console.log("a user connected");

  const userId = socket.handshake.query.userId;
  if (userId != undefined) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  //socket.on() receives a message from the client
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server }; // Expose the Express app for testing
