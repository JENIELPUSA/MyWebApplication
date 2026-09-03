import { useContext, useEffect } from "react";
import { RequestDisplayContext } from "../components/Context/MaintenanceRequest/DisplayRequest.jsx";
import { useAuth } from "../components/Context/AuthContext.jsx";
import socket from "../socket.js"; // Adjust path if needed

const SocketListener = () => {
  const { role, userId } = useAuth();
  const { setIsNewDataAvailable } = useContext(RequestDisplayContext);

  useEffect(() => {
    if (!userId || !role) return; // Wait until userId and role are available

    // ✅ Connect socket and register user
    if (!socket.connected) {
      socket.connect();
    }
    
    // ✅ Register user with the correct role (keep original capitalization)
    socket.emit("register-user", userId, role);

    // --- Event Handlers ---
    const handleNotification = (data) => {
      console.log("New maintenance notification:", data);
      setIsNewDataAvailable(true); // Trigger context update
    };

    const handleScheduleMaintenance = (data) => {
      console.log("Scheduled maintenance data:", data);
      // You can update context or show a toast / modal here
    };

    const handleTechnicianAssigned = (data) => {
      console.log("Technician assigned:", data);
      // Handle technician assignment notification
    };

    const handleStatusUpdate = (data) => {
      console.log("Status updated:", data);
      setIsNewDataAvailable(true);
    };

    // --- Register Socket Events ---
    socket.on("maintenance-notifications", handleNotification);
    socket.on("send-notifications", handleScheduleMaintenance);
    socket.on("technician-assigned", handleTechnicianAssigned);
    socket.on("status-updated", handleStatusUpdate);

    // --- Log connection status ---
    console.log(`🔌 Socket connected: ${socket.connected}`);
    console.log(`👤 Registered user: ${userId} with role: ${role}`);

    // --- Cleanup on unmount or dependency change ---
    return () => {
      // Remove all event listeners
      socket.off("maintenance-notifications", handleNotification);
      socket.off("send-notifications", handleScheduleMaintenance);
      socket.off("technician-assigned", handleTechnicianAssigned);
      socket.off("status-updated", handleStatusUpdate);

      // ⚠️ Be careful: Only disconnect if this is the last component using socket
      // Better to keep connection alive for other components
      // if (socket.connected) {
      //   socket.disconnect();
      // }
      
      console.log(`🔌 Socket cleanup for user: ${userId}`);
    };
  }, [role, userId, setIsNewDataAvailable]);

  return null;
};

export default SocketListener;