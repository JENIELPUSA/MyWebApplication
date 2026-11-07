import { useContext, useEffect, useRef } from "react";
import socket, { connectSocket } from "../socket.js";
import { EquipmentDataContext } from "./contexts/EquipmentContext/EquipmentContext.jsx";
import { MessagePOSTcontext } from "./contexts/MessageContext/POSTmessage.jsx";
import { MaintenanceRecordContext } from "./contexts/PMSMaintenanceRecord/PMSMaintenanceRecord.jsx";
import { MaintenanceRequestContext } from "./contexts/MaintenanceRequestContext/MaintenanceRequestContext.jsx";

const SocketListener = () => {
  const { fetchEquipmentData } = useContext(EquipmentDataContext);
  const { fetchDisplayMessage } = useContext(MessagePOSTcontext);
  const { fetchRequestData } = useContext(MaintenanceRecordContext);
  const { fetchTechnicianTasks } = useContext(MaintenanceRequestContext);

  const ctxRef = useRef({});

  useEffect(() => {
    ctxRef.current = {
      fetchEquipmentData,
      fetchDisplayMessage,
      fetchRequestData,
      fetchTechnicianTasks,
    };
  }, [
    fetchEquipmentData,
    fetchDisplayMessage,
    fetchRequestData,
    fetchTechnicianTasks,
  ]);

  // =====================================================
  // MAIN SOCKET EFFECT — runs ONCE
  // =====================================================
  useEffect(() => {
    // ---------------------------------------------
    // Helper: register on the SERVER
    // ---------------------------------------------
    const doRegister = () => {
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");

      // ✅ userId lang ang kailangan
      if (!userId || !role) {
        console.warn(
          "[SocketListener] missing userId/role in localStorage — skip register"
        );
        return;
      }

      socket.emit("register-user", userId, role);

      console.log(
        `[SocketListener] register-user → userId=${userId}, role=${role}`
      );
    };

    // ---------------------------------------------
    // Register NOW if connected, AND on every connect/reconnect
    // ---------------------------------------------
    if (socket.connected) {
      doRegister();
    } else {
      socket.once("connect", doRegister);
    }

    socket.on("reconnect", doRegister);

    // Ensure we're connecting
    connectSocket();

    // ---------------------------------------------
    // Handlers
    // ---------------------------------------------

    const handleUpdateEquipment = (data) => {
      console.log("📌 [EVENT] update_equipment:updated:", data);
      const c = ctxRef.current;

      if (c.fetchEquipmentData) c.fetchEquipmentData();
      if (c.fetchRequestData) c.fetchRequestData();
      if (c.fetchTechnicianTasks) c.fetchTechnicianTasks();

      window.dispatchEvent(
        new CustomEvent("equipment:updated", { detail: data?.payload || data })
      );
    };

    const handleStatusEquipmentUpdate = (payload) => {
      console.log("📌 [EVENT] updatestatusequipment:update:", payload);
      const c = ctxRef.current;

      if (c.fetchEquipmentData) c.fetchEquipmentData();
      if (c.fetchRequestData) c.fetchRequestData();
    };

    const handlePrivateAlert = (data) => {
      console.log("📩 [EVENT] private-alert:", data);
      window.dispatchEvent(
        new CustomEvent("private-alert", { detail: data })
      );
    };

    // ---------------------------------------------
    // Attach listeners
    // ---------------------------------------------
    socket.on("update_equipment:updated", handleUpdateEquipment);
    socket.on("updatestatusequipment:update", handleStatusEquipmentUpdate);
    socket.on("private-alert", handlePrivateAlert);

    console.log("🎧 [SocketListener] All listeners attached.");

    // ---------------------------------------------
    // Cleanup
    // ---------------------------------------------
    return () => {
      socket.off("connect", doRegister);
      socket.off("reconnect", doRegister);

      socket.off("update_equipment:updated", handleUpdateEquipment);
      socket.off("updatestatusequipment:update", handleStatusEquipmentUpdate);
      socket.off("private-alert", handlePrivateAlert);

      console.log("🧹 [SocketListener] Cleaned up.");
    };
  }, []);

  return null;
};

export default SocketListener;