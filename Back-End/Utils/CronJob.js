<<<<<<< HEAD
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
=======
const cron = require('node-cron');
const Schedule = require('../Models/TypesOfMaintenace'); // Your model
const socketIO = require('socket.io-client'); // For sending notifications via Socket.IO

// Replace with your actual server URL
// Set up Socket.IO client to send notifications to the server
const socket = socketIO(`https://mywebapplicationapi.onrender.com`);
// Ensure the socket connection is established before emitting notifications
socket.on('connect', () => {
  cron.schedule('0 7 * * *', async () => {
    const today = new Date();
    console.log("Today:", today.toISOString());
    
    try {
      // Find all maintenance schedules that have a nextMaintenanceDate set and are not yet notified
      const schedules = await Schedule.find({
        nextMaintenanceDate: { $lte: today, $ne: null },
        notified: false,
      });  

      for (const schedule of schedules) {
        const nextMaintenanceDate = new Date(schedule.nextMaintenanceDate);
        console.log("Next Maintenance Date:", nextMaintenanceDate.toISOString());
        
        const oneDayAhead = new Date(today);
        oneDayAhead.setDate(today.getDate() + 1);
        console.log("One Day Ahead:", oneDayAhead.toISOString());
  
        // Check if the schedule is overdue or due in the next day
        if (nextMaintenanceDate <= oneDayAhead) {
          const isTypeNotification = schedule.notified;
          console.log("isTypeNotification", isTypeNotification);
          
          if (!isTypeNotification) {
            sendSocketNotification(socket, schedule);
            
            // Mark this schedule as notified
            schedule.notified = true;
            await schedule.save(); // Ensure the updated schedule is saved with notified status
            console.log(`Notification sent for schedule ${schedule._id}`);
          } else {
            console.log(`Schedule ${schedule._id} has already been notified.`);
          }
        } else {
          console.log(`Schedule ${schedule._id} is not yet due.`);
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    }
  });
  

  console.log('Cron job for maintenance notifications is set up.');
});

// Function to send Socket.IO notification to the client
function sendSocketNotification(socket, schedule) {
  // Emit a message to the client
  socket.emit('send-notifications', {
    equipmentType: schedule.equipmentType,
    Laboratory: schedule.Laboratory,
    Department:schedule.Department,
    nextMaintenanceDate: schedule.nextMaintenanceDate,
    Description: `For ${schedule.scheduleType} Maintenance.`,
  });
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
}
