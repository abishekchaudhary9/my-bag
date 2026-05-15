const { Server } = require("socket.io");

let io;

function initSocket(server, allowedOrigins) {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn(`[Socket] CORS request blocked from origin: ${origin}`);
        return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join_user", (userId) => {
      if (!userId) {
        console.warn("[Socket] join_user called without userId");
        return;
      }
      socket.join(`user_${userId}`);
      console.log(`[Socket] User ${userId} joined their private channel`);
    });

    socket.on("join_admin", () => {
      socket.join("admins");
      console.log("[Socket] Admin joined the management channel");
    });

    socket.on("join_product", (productId) => {
      if (!productId) {
        console.warn("[Socket] join_product called without productId");
        return;
      }
      socket.join(`product:${productId}`);
      console.log(`[Socket] Client joined room for product:${productId}`);
    });

    socket.on("leave_product", (productId) => {
      if (!productId) {
        console.warn("[Socket] leave_product called without productId");
        return;
      }
      socket.leave(`product:${productId}`);
      console.log(`[Socket] Client left room for product:${productId}`);
    });

    socket.on("error", (error) => {
      console.error(`[Socket] Error from ${socket.id}:`, error);
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

/**
 * Standardized event emission with logging
 * @param {string} room - Target room (e.g., 'user_123', 'admins', 'product:456')
 * @param {string} event - Event name
 * @param {object} data - Event data with standard structure
 */
const emitEvent = (room, event, data) => {
  if (io) {
    const eventPayload = {
      ...(data || {}),
      timestamp: new Date().toISOString()
    };
    io.to(room).emit(event, eventPayload);
    console.log(`[Socket] Event emitted to ${room}: ${event}`);
  }
};

/**
 * Broadcast event to all users
 */
const broadcastToAll = (event, data) => {
  if (io) {
    const eventPayload = {
      ...(data || {}),
      timestamp: new Date().toISOString()
    };
    io.emit(event, eventPayload);
    console.log(`[Socket] Broadcast event: ${event}`);
  }
};

/**
 * Send event to specific user
 */
const sendToUser = (userId, event, data) => {
  emitEvent(`user_${userId}`, event, data);
};

/**
 * Send event to all admins
 */
const sendToAdmins = (event, data) => {
  emitEvent("admins", event, data);
};

module.exports = { initSocket, getIo, emitEvent, broadcastToAll, sendToUser, sendToAdmins };
