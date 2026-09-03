const cron = require("node-cron");
const mongoose = require("mongoose");
const Schedule = require("../Models/TypesOfMaintenace");
const Message = require("../Models/Message");
const socketIO = require("socket.io-client");

const socket = socketIO("http://localhost:3000");

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

cron.schedule("*/1 * * * *", async () => {
  const today = new Date();
  console.log("Cron running at:", today.toISOString());

  try {
    // Populate all necessary references
    const schedules = await Schedule.find({
      nextMaintenanceDate: { $lte: today, $ne: null },
      notified: false,
    })
      .populate("Laboratory")
      .populate("Department")
      .populate("equipmentType");

    for (const schedule of schedules) {
      console.log("Found schedule:", schedule._id);

      const laboratory = schedule.Laboratory;
      const department = schedule.Department;
      const equipment = schedule.equipmentType;

      const laboratoryName = laboratory?.LaboratoryName || "N/A";
      const departmentName = department?.DepartmentName || "N/A";
      const serialNumber = equipment?.SerialNumber || "N/A";

      // Build complete message
      const messageText = `
${schedule.scheduleType.toUpperCase()} MAINTENANCE

Laboratory: ${laboratoryName}
Department: ${departmentName}
Serial Number: ${serialNumber}
      `.trim();

      const messageData = {
        message: messageText,
        Status: "Pending",
        Laboratory: laboratory ? [laboratory._id] : [],
        Equipments: equipment ? equipment._id : null,
        To: "Technician",
        Encharge: schedule.assignedTechnician || null,
        role: "Technician",
        types:"maintenanceSched",
        RequestID: null,
        viewers: schedule.assignedTechnician
          ? [{ user: schedule.assignedTechnician, isRead: false }]
          : [],
      };

      // Emit socket notification
      if (socket.connected) {
        socket.emit("send-notifications", messageData);
        console.log(`Notification sent for schedule ${schedule._id}`);
      }

      // Save message in database
      await Message.create(messageData);
      console.log(`Message saved for schedule ${schedule._id}`);

      // Update schedule dates
      schedule.lastMaintenanceDate = schedule.nextMaintenanceDate;
      schedule.nextMaintenanceDate = calculateNextMaintenanceDate(
        schedule.lastMaintenanceDate,
        schedule.scheduleType
      );

      // IMPORTANT: Mark as notified to prevent duplicate alerts
      schedule.notified = true;

      await schedule.save();

      console.log(
        `Schedule ${schedule._id} updated. Next maintenance: ${schedule.nextMaintenanceDate}`
      );
    }
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

// Function to calculate next maintenance date
function calculateNextMaintenanceDate(lastDate, scheduleType) {
  const nextDate = new Date(lastDate);

  switch (scheduleType) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "semi-annually":
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case "annually":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
}
