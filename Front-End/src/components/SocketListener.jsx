import { useContext, useEffect } from "react";
import { RequestDisplayContext } from "../components/Context/MaintenanceRequest/DisplayRequest.jsx";
import { useAuth } from "../components/Context/AuthContext.jsx";
import socket from "../socket.js"; // Adjust path if needed

const SocketListener = () => {
  const { role, userId } = useAuth();
  const { setIsNewDataAvailable } = useContext(RequestDisplayContext);

  useEffect(() => {
    if (!userId || !role) return; // Wait until userId and role are available

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
      socket.emit("register-user", userId, role);
    }

    // --- Event Handlers ---
    const handleNotification = (data) => {
      console.log("New maintenance notification:", data);
      setIsNewDataAvailable(true); // Trigger context update
    };

    const handleScheduleMaintenance = (data) => {
      console.log("Scheduled maintenance data:", data);
      // You can update context or show a toast / modal here
    };

    // --- Register Socket Events ---
    socket.on("maintenance-notifications", handleNotification);
    socket.on("send-notifications", handleScheduleMaintenance);

    // --- Cleanup on unmount or dependency change ---
    return () => {
      socket.off("maintenance-notifications", handleNotification);
      socket.off("send-notifications", handleScheduleMaintenance);

      // Optional: Disconnect socket if needed
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [role, userId, setIsNewDataAvailable]);

  return null;
};

export default SocketListener;
