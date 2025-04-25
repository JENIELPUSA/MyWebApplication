import { io } from "socket.io-client";

// Initialize socket connection
const socket = io("https://mywebapplicationapi.onrender.com", {
  transports: ["websocket"],  // Use WebSocket only (ensure WebSocket is enabled on the server)
  reconnection: true,         // Allow automatic reconnection attempts
  reconnectionAttempts: 5,    // Limit the number of reconnection attempts
  reconnectionDelay: 3000,    // Delay between reconnection attempts in ms
  withCredentials: true,      // Include credentials (cookies, headers) in the request if needed
});

export default socket; // Export the single socket instance for reuse in other parts of the app
