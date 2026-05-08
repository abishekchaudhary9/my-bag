const { Server } = require("socket.io");

let io;

function initSocket(server, allowedOrigins) {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join_user", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket] User ${userId} joined their private channel`);
    });

    socket.on("join_admin", () => {
      socket.join("admins");
      console.log("[Socket] Admin joined the management channel");
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

// Helper to emit events easily from anywhere in the app
const emitEvent = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

module.exports = { initSocket, getIo, emitEvent };
