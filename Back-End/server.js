const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

const app = require("./app");
const initDefaultUser = require("./Controller/initDefaultUser");
const UserLoginSchema = require("./Models/usermodel"); // adjust path

const {
  roleRoom,
  userRoom,
  privateRoom,
  ROOM_ALL_ROLES,
} = require("./rooms");

const SECRET_STR = process.env.SECRET_STR || process.env.SECRET_STR;

app.set("trust proxy", true);

// =========================================================
// SERVER — define FIRST (para magamit sa error handlers)
// =========================================================
const server = http.createServer(app);

// =========================================================
// GLOBAL ERROR HANDLERS
// =========================================================
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception! Shutting down...");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection! Shutting down...");
  console.error(err);
  server.close(() => process.exit(1));
});

// =========================================================
// SOCKET.IO
// =========================================================
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
});

app.set("io", io);

// =========================================================
// SOCKET AUTH MIDDLEWARE
// =========================================================
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      console.warn(`[Socket] ❌ No token for socket ${socket.id}`);
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, SECRET_STR);

    const user = await UserLoginSchema.findById(decoded.id).select(
      "_id role linkedId firstName lastName"
    );

    if (!user) return next(new Error("User not found"));

    socket.user = user;
    console.log(
      `[Socket] ✅ Auth OK: ${user._id} (role=${user.role}) socket=${socket.id}`
    );
    next();
  } catch (err) {
    console.error(`[Socket] ❌ Auth error: ${err.message}`);
    next(new Error("Unauthorized"));
  }
});

// =========================================================
// CONNECTION
// =========================================================
global.connectedUsers = {};

io.on("connection", (socket) => {
  console.log(`🔌 New Connection: ${socket.id}`);

  // ==========================================================
  // RFID SCANNER
  // ==========================================================
  socket.on("rfid-scanned", (data) => {
    console.log("UID received:", data?.uid);
    io.emit("rfid-scanned", {
      ...data,
      timestamp: new Date(),
    });
  });

  // ==========================================================
  // REGISTER USER — joins all necessary rooms
  // ==========================================================
  socket.on("register-user", (userId, role) => {
    if (!userId || !role) {
      console.log("⚠️ No User ID or Role provided");
      return;
    }

    const normalizedRole = String(role).toLowerCase().trim();

    socket.userId = userId;
    socket.role = normalizedRole;

    // ---- Common rooms (using helpers) ----
    socket.join(userRoom(userId));
    socket.join(roleRoom(normalizedRole));
    socket.join(privateRoom(normalizedRole, userId));
    socket.join(ROOM_ALL_ROLES);

    global.connectedUsers[userId] = socket.id;

    console.log(
      `✅ ${normalizedRole.toUpperCase()}: ${userId} (socket: ${socket.id})`
    );
  });

  // ==========================================================
  // UNIVERSAL MESSAGING
  // Supports:
  //   - self-message only        → { self: true }
  //   - specific users           → { targetUsers: ["id1", "id2"] }
  //   - specific roles           → { targetRoles: ["technician", "admin"] }
  //   - all roles                → { targetRoles: ["all"] }
  //   - include sender           → { includeSelf: true }
  // ==========================================================
  socket.on("send-message", (data) => {
    try {
      const {
        targetRoles,
        targetUsers,
        event,
        payload,
        self,
        includeSelf,
      } = data || {};

      if (!event) {
        console.log("⚠️ send-message: no event name provided");
        return;
      }

      const messageData = {
        ...payload,
        from: socket.userId,
        fromRole: socket.role,
        timestamp: new Date(),
      };

      const emitToSelf = () => {
        if (socket.userId) {
          io.to(userRoom(socket.userId)).emit(event, messageData);
        }
      };

      // --------------------------------------------------------
      // 1. SELF MESSAGE ONLY
      // --------------------------------------------------------
      if (self === true) {
        emitToSelf();
        console.log(`📨 ${socket.role}:${socket.userId} → SELF`);
        return;
      }

      // --------------------------------------------------------
      // 2. SPECIFIC USERS
      // --------------------------------------------------------
      if (Array.isArray(targetUsers) && targetUsers.length > 0) {
        targetUsers.forEach((uid) => {
          if (uid) {
            io.to(userRoom(uid)).emit(event, messageData);
          }
        });

        if (includeSelf && !targetUsers.includes(socket.userId)) {
          emitToSelf();
        }

        console.log(
          `📨 ${socket.role}:${socket.userId} → users: ${targetUsers.join(", ")}`
        );
        return;
      }

      // --------------------------------------------------------
      // 3. SPECIFIC ROLES
      // --------------------------------------------------------
      if (Array.isArray(targetRoles) && targetRoles.length > 0) {
        // ---- ALL ROLES ----
        if (targetRoles.includes("all")) {
          io.to(ROOM_ALL_ROLES).emit(event, messageData);
          console.log(`📨 ${socket.role}:${socket.userId} → ALL ROLES`);
          return;
        }

        // ---- MULTIPLE ROLES ----
        targetRoles.forEach((role) => {
          io.to(roleRoom(role)).emit(event, messageData);
        });

        // Optional: include sender if not already covered by role
        if (includeSelf) {
          const includesSelfRole = targetRoles
            .map((r) => String(r).toLowerCase())
            .includes(socket.role);

          if (!includesSelfRole) {
            emitToSelf();
          }
        }

        console.log(
          `📨 ${socket.role}:${socket.userId} → roles: ${targetRoles.join(", ")}`
        );
        return;
      }

      console.log("⚠️ send-message: no target specified");
    } catch (err) {
      console.error("❌ send-message error:", err);
    }
  });

  // ==========================================================
  // EQUIPMENT STATUS UPDATE
  // ==========================================================
  socket.on("updatestatusequipment:send", (payload) => {
    try {
      const ownerId = payload?.loan?.userId;

      // Admin gets all updates
      io.to(roleRoom("admin")).emit("updatestatusequipment:update", payload);

      // Owner gets own update
      if (ownerId) {
        io.to(userRoom(ownerId)).emit(
          "updatestatusequipment:update",
          payload
        );
      }
    } catch (err) {
      console.error("Socket equipment update error:", err);
    }
  });

  // ==========================================================
  // DISCONNECT
  // ==========================================================
  socket.on("disconnect", () => {
    if (socket.userId) {
      delete global.connectedUsers[socket.userId];
    }
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// =========================================================
// DB CONNECT + START SERVER
// =========================================================
mongoose
  .connect(process.env.CONN_STR)
  .then(async () => {
    console.log("✅ Database connected successfully");
    await initDefaultUser();

    const port = process.env.PORT || 3000;
    server.listen(port, () =>
      console.log(`🚀 Server running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });