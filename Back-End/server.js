const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
let adminSocketId = null; // To store the admin's socket ID
const user = require("./Models/usermodel");
const sendEmail = require("../Back-End/Utils/email");
const IncomingNotification = require("./Models/UnreadIncomingMaintenance");
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
    origin:"https://my-web-application-one.vercel.app",  // Use the environment variable
    methods: ["GET", "POST"],
    credentials: true,  // Allow cookies and auth headers
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 5000,
});

// Store io instance for global event handling
app.set("io", io);

// Socket.io event handling
let messageCount = 0; // Track new notifications count


io.on("connection", (socket) => {
  // Register user and admin socket ID
  socket.on("register-user", (userId, role) => {
    console.log(role);
    if (role === "admin") {
      adminSocketId = socket.id; // Save the admin's socket ID
      console.log(`Admin registered with socket ID ${socket.id}`);
    }
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Handling new request
  socket.on("newRequest", (data) => {
    messageCount++; // Increment the count
    console.log("New request received:", data);

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

  socket.on("send-notifications", async (data) => {
    if (adminSocketId) {
      // Admin is online — send real-time notification
      io.to(adminSocketId).emit("maintenance-notifications", data);
    } else {
      // Admin is offline — save to DB and send emails individually
      try {
        // Save to database
        await IncomingNotification.create({
          Description: data.Description,
          Equipments: data.equipmentType,
          Department: data.Department,
          Laboratory: data.Laboratory,
        });
        console.log("Admin is offline. Notification saved to DB.");
  
        // Get all admin users
        const admins = await user.find({ role: "admin" });
        const resetUrl = `http://localhost:5173/login`;
        // Construct message
        const msg = `
          Please check your dashboard.A new maintenance request has been submitted and requires your attention.\nClick to login: ${resetUrl}
        `;
  
        // Send individual email to each admin
        for (const admin of admins) {
          await sendEmail({
            email: admin.email,
            subject: "New Maintenance Notification",
            text: msg,
          });
        }
  
      } catch (err) {
        console.error(
          "Failed to handle offline admin notification:",
          err.message
        );
      }
    }
  });
  

  // Reset notification count when cleared
  socket.on("clearNotifications", () => {
    messageCount = 0; // Reset count
    io.emit("notificationCountReset", { count: 0 });
  });

  // Handling disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);

    // If the admin disconnects, clear the adminSocketId
    if (socket.id === adminSocketId) {
      adminSocketId = null;
      console.log("Admin disconnected, adminSocketId cleared");
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.CONN_STR)
  .then(() => console.log(" DB connected successfully"))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...");
  console.error(err.name, err.message, err.stack);

  server.close(() => {
    process.exit(1);
  });
});

require("./Utils/CronJob");
