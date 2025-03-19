const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Change this to your React frontend URL
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies and auth headers
  },
  transports: ["websocket", "polling"], // Ensure proper transport
  pingInterval: 25000, // Regular ping to prevent disconnection
  pingTimeout: 5000, // Timeout before assuming client is disconnected
});

// Store io instance for global event handling
app.set("io", io);

// Socket.io event handling
let messageCount = 0; // Track new notifications count

io.on("connection", (socket) => {
  // Event: Notify admin when a new request is added
  socket.on("newRequest", (data) => {
    messageCount++; // Increment the count
    console.log("📩 New request received:", data);

    io.emit("adminNotification", {
      message: "A new request has been added!",
      data: data,
      count: messageCount, // Send count along with notification
    });

    io.emit("SMSNotification", {
      message: "A new request has been added!",
      data: data,
      count: messageCount, // Send count along with notification
    });
  });

  // Reset notification count when cleared
  socket.on("clearNotifications", () => {
    messageCount = 0; // Reset count
    io.emit("notificationCountReset", { count: 0 });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB connected successfully"))
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...");
  console.error(err.name, err.message, err.stack);

  server.close(() => {
    process.exit(1);
  });
});
