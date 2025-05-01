import { useContext, useEffect } from "react";
import { RequestDisplayContext } from "../components/Context/MaintenanceRequest/DisplayRequest.jsx";
import { useAuth } from "../components/Context/AuthContext.jsx";
import socket from "../socket.js"; // Adjust path if needed

const SocketListener = () => {
  const { role, userId } = useAuth();
  const { setIsNewDataAvailable } = useContext(RequestDisplayContext); // Assume this is in your context

  useEffect(() => {
    // Connect to socket only if not already connected
    if (userId && role && !socket.connected) {
      socket.connect();
      socket.emit("register-user", userId, role);
    }

    if (role === "admin") {
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
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [role, userId, setIsNewDataAvailable]);

  return null;
};

export default SocketListener;
