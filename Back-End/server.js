const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const app = require("./app");
const initDefaultUser = require("./Controller/initDefaultUser");

app.set("trust proxy", true);

// ==========================
// 1. ERROR HANDLING
// ==========================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err);
  process.exit(1);
});

const server = http.createServer(app);

// ==========================
// 2. SOCKET.IO CONFIG
// ==========================
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

app.set("io", io);

// ==========================
// 3. DEV vs PRODUCTION (RFID Python Bridge)
// ==========================
if (process.env.NODE_ENV === "development") {
  const pythonCmd = process.platform === "win32" ? "py" : "python3";
  const desktopPath = path.join(
    os.homedir(),
    "Desktop",
    "RFID-Bridge",
    "scan.py"
  );

  console.log(`🛠️ Dev Mode: Spawning local Python at ${desktopPath}`);
  const rfidPython = spawn(pythonCmd, [desktopPath]);

  rfidPython.stdout.on("data", (data) => {
    const cardUID = data.toString().trim();
    if (cardUID && cardUID !== "NO_READER") {
      console.log(`Local Scan: ${cardUID}`);
      io.emit("rfid-scanned", {
        uid: cardUID,
        timestamp: new Date(),
        source: "Local-Spawn",
      });
    }
  });

  rfidPython.stderr.on("data", (data) =>
    console.error(`Python Error: ${data}`)
  );
} else {
  console.log(
    "🚀 Production Mode: Waiting for remote RFID bridge from your Desktop..."
  );
}

// ==========================
// 4. GLOBAL USERS TRACKING
// ==========================
global.connectedUsers = {};

io.on("connection", (socket) => {
  console.log(`🔌 New Connection: ${socket.id}`);

  // ==========================
  // RFID SCANNER (browser-side bridge)
  // ==========================
  socket.on("rfid-scanned", (data) => {
    console.log("UID received:", data.uid);

    io.emit("rfid-scanned", {
      ...data,
      timestamp: new Date(),
    });
  });

  // ==========================
  // REGISTER USER (ROLE-BASED ROOMS)
  // Roles: User | Admin | Technician | Supply
  // ==========================
  socket.on("register-user", (userId, role) => {
    if (!userId || !role) {
      console.log("⚠️ No User ID or Role provided");
      return;
    }

    const normalizedRole = role.toLowerCase();

    socket.userId = userId;
    socket.role = normalizedRole;

    socket.join(`user:${userId}`);
    global.connectedUsers[userId] = socket.id;

    switch (normalizedRole) {
      case "admin":
        socket.join("role:admin");
        socket.join("admin-shared");
        socket.join(`private:admin:${userId}`);
        console.log(`🛡️ ADMIN: ${userId}`);
        break;

      case "user":
        socket.join("role:user");
        socket.join("admin-shared");
        socket.join(`private:user:${userId}`);
        console.log(`👤 USER: ${userId}`);
        break;

      case "technician":
        socket.join("role:technician");
        socket.join("admin-shared");
        socket.join(`private:technician:${userId}`);
        console.log(`🔧 TECHNICIAN: ${userId}`);
        break;

      case "supply":
        socket.join("role:supply");
        socket.join("admin-shared");
        socket.join(`private:supply:${userId}`);
        console.log(`📦 SUPPLY: ${userId}`);
        break;

      default:
        console.log(`⚠️ Unknown role: ${role}`);
    }
  });

  // ==========================
  // WELLNESS LEAVE — JOIN ROOM
  // ==========================
  socket.on("wellness:join", (userId, role) => {
    if (!userId || !role) return;

    const normalizedRole = role.toLowerCase();
    socket.join(`wellness:${normalizedRole}:${userId}`);
    console.log(`📋 Wellness join: ${normalizedRole}:${userId}`);
  });

  // ==========================
  // ADMIN → USER (private alert)
  // ==========================
  socket.on("admin:send-to-user", (targetUserId, messageData) => {
    if (socket.role !== "admin") return;

    io.to(`private:user:${targetUserId}`).emit("private-alert", {
      ...messageData,
      from: socket.userId,
      timestamp: new Date(),
    });
  });

  // ==========================
  // ADMIN → TECHNICIAN
  // ==========================
  socket.on("admin:send-to-technician", (targetUserId, messageData) => {
    if (socket.role !== "admin") return;

    io.to(`private:technician:${targetUserId}`).emit("private-alert", {
      ...messageData,
      from: socket.userId,
      timestamp: new Date(),
    });
  });

  // ==========================
  // ADMIN → SUPPLY
  // ==========================
  socket.on("admin:send-to-supply", (targetUserId, messageData) => {
    if (socket.role !== "admin") return;

    io.to(`private:supply:${targetUserId}`).emit("private-alert", {
      ...messageData,
      from: socket.userId,
      timestamp: new Date(),
    });
  });

  // ==========================
  // USER → ADMIN
  // ==========================
  socket.on("user:send-to-admin", (targetUserId, messageData) => {
    if (socket.role !== "user") return;

    io.to(`private:admin:${targetUserId}`).emit("private-alert", {
      ...messageData,
      from: socket.userId,
      timestamp: new Date(),
    });
  });

  // ==========================
  // TECHNICIAN → ADMIN
  // ==========================
  socket.on("technician:send-to-admin", (targetUserId, messageData) => {
    if (socket.role !== "technician") return;

    io.to(`private:admin:${targetUserId}`).emit("private-alert", {
      ...messageData,
      from: socket.userId,
      timestamp: new Date(),
    });
  });

  // ==========================
  // SUPPLY → ADMIN
  // ==========================
  socket.on("supply:send-to-admin", (targetUserId, messageData) => {
    if (socket.role !== "supply") return;

    io.to(`private:admin:${targetUserId}`).emit("private-alert", {
      ...messageData,
      from: socket.userId,
      timestamp: new Date(),
    });
  });

  // ==========================
  // EQUIPMENT UPDATE
  // ==========================
  socket.on("updatestatusequipment:send", (payload) => {
    try {
      const ownerId = payload?.loan?.userId;

      // Admin gets all updates
      io.to("role:admin").emit("updatestatusequipment:update", payload);

      // Owner (User/Technician/Supply) gets own update
      if (ownerId) {
        io.to(`user:${ownerId}`).emit(
          "updatestatusequipment:update",
          payload
        );
      }
    } catch (err) {
      console.error("Socket equipment update error:", err);
    }
  });

  // ==========================
  // WELLNESS LEAVE — MANUAL TRIGGER
  // ==========================
  socket.on("wellness:trigger-refresh", (data) => {
    const { targetRole, targetUserId } = data || {};

    if (targetRole) {
      const normalizedRole = targetRole.toLowerCase();
      io.to(`role:${normalizedRole}`).emit("wellness:refresh");
      console.log(`🔄 Refresh triggered for role:${normalizedRole}`);
    }

    if (targetUserId && targetRole) {
      const normalizedRole = targetRole.toLowerCase();
      io.to(`private:${normalizedRole}:${targetUserId}`).emit(
        "wellness:refresh"
      );
      console.log(
        `🔄 Refresh triggered for private:${normalizedRole}:${targetUserId}`
      );
    }
  });

  // ==========================
  // DISCONNECT
  // ==========================
  socket.on("disconnect", () => {
    if (socket.userId) {
      delete global.connectedUsers[socket.userId];
    }

    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// ==========================
// 5. DATABASE & SERVER START
// ==========================
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

// ==========================
// 6. UNHANDLED REJECTION
// ==========================
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection!");
  console.error(err);
  server.close(() => process.exit(1));
});