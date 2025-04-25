// SocketListener.jsx (Frontend)

import { useContext, useEffect } from "react";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest.jsx";
import { useAuth } from "./Context/AuthContext.jsx"; // Assuming useAuth provides role and userId
import socket from "../../../Back-End/Utils/socket.js";

const SocketListener = () => {
  const { addDescription } = useContext(RequestDisplayContext);
  const { role, userId } = useAuth(); // Get the role and userId from context

  useEffect(() => {
    // Only listen for notifications if the current user is the admin
    if (role === "admin") {
      socket.on("maintenance-notifications", (data) => {
        console.log("Received socket data:", data);
        addDescription(data.Description, data.equipmentType, data.Laboratory, data.Department);
      });

      // Debug how many listeners are attached
      console.log("Listener count:", socket.listeners("maintenance-notifications").length);
    } else {
      console.log("User is not an admin. No notifications will be received.");
    }

    // Emit register-user event after the socket connects
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
      socket.emit("register-user", userId, role);
    });

    // Cleanup listeners on component unmount
    return () => {
      if (role === "admin") {
        socket.off("maintenance-notifications");
      }
    };
  }, [role, userId, addDescription]); // Re-run if role or userId changes

  return null;
};

export default SocketListener;
