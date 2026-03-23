const dotenv = require("dotenv");
// 1. Load config muna bago ang lahat
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
const user = require("./Models/usermodel");
const sendEmail = require("../Back-End/Utils/email");
const IncomingNotification = require("./Models/UnreadIncomingMaintenance");
const requestmaintenance = require("./Models/RequestMaintenance");
const initDefaultUser = require("./Controller/initDefaultUser");

// I-set ang trust proxy para sa Express
app.set("trust proxy", true);

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
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Store io instance for global event handling
app.set("io", io);

let adminSocketId = null; 
let messageCount = 0; 

// Socket.io event handling
io.on("connection", (socket) => {
  // Register user and admin socket ID
  socket.on("register-user", (userId, role) => {
    if (role === "admin") {
      adminSocketId = socket.id;
      console.log(`Admin registered with socket ID ${socket.id}`);
    }
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Handling new request
  socket.on("newRequest", (data) => {
    messageCount++;
    console.log("New request received:", data);

    io.emit("adminNotification", {
      message: "A new request has been added!",
      data: data,
      count: messageCount,
    });

    io.emit("SMSNotification", {
      message: "A new request has been added!",
      data,
      count: messageCount,
    });
  });

  socket.on("RequestMaintenance", async (data) => {
    try {
      const requestId = data._id;

      const originalRequest = await requestmaintenance.findById(requestId).lean();

      if (!originalRequest) {
        console.error("Maintenance request not found.");
        return;
      }

      const [extraInfo] = await requestmaintenance.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(requestId) } },
        {
          $lookup: {
            from: "users",
            localField: "Technician",
            foreignField: "_id",
            as: "TechnicianDetails",
          },
        },
        { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "departments",
            localField: "Department",
            foreignField: "_id",
            as: "DepartmentInfo",
          },
        },
        { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "laboratories",
            localField: "Laboratory",
            foreignField: "_id",
            as: "LaboratoryInfo",
          },
        },
        { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "equipment",
            localField: "Equipments",
            foreignField: "_id",
            as: "EquipmentsInfo",
          },
        },
        { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "EquipmentsInfo.Category",
            foreignField: "_id",
            as: "CategoryInfo",
          },
        },
        { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: 1,
            DateTime: 1,
            Ref: 1,
            read: 1,
            Status: 1,
            feedback: 1,
            feedbackread: 1,
            Description: 1,
            EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
            EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
            CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
            DepartmentId: "$DepartmentInfo._id",
            _id: 1,
            Remarks: 1,
            Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
            remarksread: 1,
            laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
            UserId: "$TechnicianDetails._id",
            Technician: {
              $concat: [
                "$TechnicianDetails.FirstName",
                " ",
                { $ifNull: ["$TechnicianDetails.Middle", ""] },
                " ",
                "$TechnicianDetails.LastName",
              ],
            },
            DateTimeAccomplish: 1,
          },
        },
      ]);

      const finalRequest = {
        ...originalRequest,
        ...extraInfo,
      };

      io.emit("Maintenance", finalRequest);
      io.emit("UpdateMaintenance", finalRequest);

      console.log("Emitted Maintenance:", finalRequest);
    } catch (error) {
      console.error("Error in RequestMaintenance:", error);
    }
  });

  socket.on("RefreshData", () => {
    console.log("RunRefresh");
    socket.emit("refreshRequests");
  });

  socket.on("send-notifications", async (data) => {
    if (adminSocketId) {
      io.to(adminSocketId).emit("maintenance-notifications", data);
    } else {
      try {
        await IncomingNotification.create({
          Description: data.Description,
          Equipments: data.equipmentType,
          Department: data.Department,
          Laboratory: data.Laboratory,
        });
        console.log("Admin is offline. Notification saved to DB.");

        const admins = await user.find({ role: "admin" });
        const resetUrl = `https://myapp-xk0w.onrender.com`;
        const msg = `
          Please check your dashboard. A new maintenance request has been submitted and requires your attention.\nClick to login: ${resetUrl}
        `;

        for (const admin of admins) {
          await sendEmail({
            email: admin.email,
            subject: "New Maintenance Notification",
            text: msg,
          });
        }
      } catch (err) {
        console.error("Failed to handle offline admin notification:", err.message);
      }
    }
  });

  socket.on("clearNotifications", () => {
    messageCount = 0;
    io.emit("notificationCountReset", { count: 0 });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
    if (socket.id === adminSocketId) {
      adminSocketId = null;
      console.log("Admin disconnected, adminSocketId cleared");
    }
  });
});

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.CONN_STR)
  .then(async () => {
    console.log("✅ Database connected successfully");
    await initDefaultUser();
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });

// --- START SERVER ---
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