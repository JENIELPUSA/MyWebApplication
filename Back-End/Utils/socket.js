import { io } from "socket.io-client";

  const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL, {
  transports: ["websocket"], // Use WebSocket only
  reconnection: true,        // Allow reconnection
  reconnectionAttempts: 5,   // Limit reconnection attempts
  reconnectionDelay: 3000,   // Delay between reconnections
});

export default socket; // Export the single socket instance
