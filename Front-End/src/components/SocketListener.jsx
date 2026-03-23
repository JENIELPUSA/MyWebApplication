import { useContext, useEffect } from "react";
import { RequestDisplayContext } from "../components/Context/MaintenanceRequest/DisplayRequest.jsx";
import { useAuth } from "../components/Context/AuthContext.jsx";
import socket from "../socket.js"; // Adjust path if needed

const SocketListener = () => {
  const { role, userId } = useAuth();
<<<<<<< HEAD
  const { setIsNewDataAvailable } = useContext(RequestDisplayContext);

  useEffect(() => {
    if (!userId || !role) return; // Wait until userId and role are available

    // Connect socket if not already connected
    if (!socket.connected) {
=======
  const { setIsNewDataAvailable } = useContext(RequestDisplayContext); // Assume this is in your context

  useEffect(() => {
    // Connect to socket only if not already connected
    if (userId && role && !socket.connected) {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      socket.connect();
      socket.emit("register-user", userId, role);
    }

<<<<<<< HEAD
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
=======
    if (role === "Admin") {
      // Handle maintenance notifications for admin
      const handleNotification = (data) => {
        console.log("New maintenance notification:", data);
        // Here you could trigger the context to flag that new data is available
        setIsNewDataAvailable(true);  // Assuming you have a context method to trigger this
      };

      // Listen for 'maintenance-notifications' event
      socket.on("maintenance-notifications", handleNotification);

      // Cleanup event listener on component unmount
      return () => {
        socket.off("maintenance-notifications", handleNotification);
      };
    }

    // Make sure to return cleanup for socket connection in case the role or userId changes
    return () => {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [role, userId, setIsNewDataAvailable]);

  return null;
};

export default SocketListener;
