import { useEffect, useContext } from "react";
import socket from "../socket.js";
import { EquipmentDataContext } from "./contexts/EquipmentContext/EquipmentContext.jsx";
import { MessagePOSTcontext } from "./contexts/MessageContext/POSTmessage.jsx";
import { MaintenanceRecordContext } from "./contexts/PMSMaintenanceRecord/PMSMaintenanceRecord.jsx";
import { MaintenanceRequestContext } from "./contexts/MaintenanceRequestContext/MaintenanceRequestContext.jsx";
const SocketListener = () => {
    const { fetchRequestData } = useContext(MaintenanceRecordContext);
    const { fetchEquipmentData, fetchMyLaboratory } = useContext(EquipmentDataContext);
    const { fetchDisplayMessage } = useContext(MessagePOSTcontext);
    const {fetchTechnicianTasks}=useContext(MaintenanceRequestContext)

    useEffect(() => {
        const role = localStorage.getItem("role");
        const linkId = localStorage.getItem("linkId");

        console.log("🔌 [SocketListener] Mounting...");
        console.log("👤 [SocketListener] role:", role);
        console.log("🆔 [SocketListener] linkId:", linkId);

        if (!linkId || !role) {
            console.warn("⚠️ [SocketListener] Missing linkId or role. Skipping registration.");
            return;
        }

        // ==========================
        // SOCKET CONNECTION STATUS
        // ==========================
        socket.on("connect", () => {
            console.log("✅ [Socket] Connected! Socket ID:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.warn("❌ [Socket] Disconnected. Reason:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("🚨 [Socket] Connection Error:", error.message);
        });

        // ==========================
        // REGISTER USER
        // ==========================
        socket.emit("register-user", linkId, role);
        console.log(`📤 [Socket] Emitted 'register-user' with linkId=${linkId}, role=${role}`);

        // ==========================
        // MAINTENANCE CREATED
        // ==========================
        const handleMaintenanceCreated = (data) => {
            console.log("📌 [EVENT] requestmaintenance:created");
            console.log("   ➜ Data:", data);
            fetchDisplayMessage();
            fetchRequestData();
            fetchTechnicianTasks();
        };


        const handleUpdateEquipment = (data) => {
            console.log("📌 [EVENT] requestmaintenance:created");
            console.log("   ➜ Data:", data);
            fetchRequestData();
        };


        const handlemarkAll = (data) => {
            console.log("📌 [EVENT] requestmaintenance:created");
            console.log("   ➜ Data:", data);
            fetchDisplayMessage();
        }

        // ==========================
        // CONTRACT CREATED / UPDATED
        // ==========================
        const handleContractCreated = async ({ payload }) => {
            console.log("📄 [EVENT] contract:created");
            console.log("   ➜ Payload:", payload);

            window.dispatchEvent(
                new CustomEvent("contract:created", { detail: payload })
            );
        };

        // ==========================
        // ✅ ASSIGN EQUIPMENT — CREATED
        // ==========================
        const handleAssignEquipmentCreated = (data) => {
            console.log("🆕 [EVENT] assignEquipment:created");
            console.log("   ➜ Data:", data);
            fetchEquipmentData();
        };

        // ==========================
        // LISTENERS
        // ==========================
        socket.on("contract:created", handleContractCreated);

        // Assign Equipment listeners
        socket.on("assignEquipment:created", handleAssignEquipmentCreated);
        socket.on("requestmaintenance:created", handleMaintenanceCreated);
        socket.on("mark_all:created", handlemarkAll);
        console.log("🎧 [SocketListener] All listeners attached.");
        socket.on("update_equipment:updated", handleUpdateEquipment);
        // ==========================
        // CLEANUP
        // ==========================
        return () => {
            console.log("🧹 [SocketListener] Cleaning up listeners...");
            socket.off("update_equipment:updated", handleUpdateEquipment);
            socket.off("contract:created", handleContractCreated);
            socket.off("requestmaintenance:created", handleMaintenanceCreated);
            socket.off("assignEquipment:created", handleAssignEquipmentCreated);
            socket.off("mark_all:created", handlemarkAll);

            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
        };
    }, []);

    return null;
};

export default SocketListener;