
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');  // Import your Express app

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);

// Configure CORS for regular HTTP requests
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Vercel frontend URL
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,  // Allow cookies and headers
}));

// Configure Socket.io CORS for WebSocket connections
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,  // Vercel frontend URL
    methods: ["GET", "POST"],
    credentials: true,  // Allow credentials for Socket.io
  },
  transports: ["websocket", "polling"],  // Specify transports (websocket and polling)
  pingInterval: 25000,
  pingTimeout: 5000,
});

// Store io instance for global event handling
app.set('io', io);

// Socket.io event handling
let messageCount = 0; // Track new notifications count

// Socket.io connection event
io.on('connection', (socket) => {
  // Register user and admin socket ID
  socket.on('register-user', (userId, role) => {
    if (role === 'admin') {
      adminSocketId = socket.id; // Save the admin's socket ID
    }
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Handling new request
  socket.on('newRequest', (data) => {
    messageCount++;  // Increment the count
    io.emit('adminNotification', {
      message: 'A new request has been added!',
      data: data,
      count: messageCount,  // Send count along with notification
    });
  });

  // Handling send notifications
  socket.on('send-notifications', async (data) => {
    if (adminSocketId) {
      io.to(adminSocketId).emit('maintenance-notifications', data);  // Send notification to admin
    } else {
      // Handle offline admin - save to DB and send emails
      try {
        // Save to database and send email to admin (this part needs to be implemented based on your system)
      } catch (err) {
        console.error('Error handling offline admin notification:', err.message);
      }
    }
  });

  // Reset notification count
  socket.on('clearNotifications', () => {
    messageCount = 0;  // Reset count
    io.emit('notificationCountReset', { count: 0 });
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    if (socket.id === adminSocketId) {
      adminSocketId = null;
      console.log('Admin disconnected, adminSocketId cleared');
    }
  });
});

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose
  .connect(process.env.CONN_STR)
  .then(() => console.log('DB connected successfully'))
  .catch((err) => {
    console.error('Database connection error:', err.message);
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

require('./Utils/CronJob');  // If you have a cron job setup
