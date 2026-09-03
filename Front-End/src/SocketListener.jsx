import { useContext, useEffect, useRef } from "react";
import { useAuth } from "../src/contexts/AuthContext.jsx";
import socket from "../socket.js";
import { MessagePOSTcontext } from "../src/contexts/MessageContext/POSTmessage.jsx";

const SocketListener = () => {
    const { fetchDisplayMessage } = useContext(MessagePOSTcontext);
    const { role, linkId } = useAuth();
    const debounceRef = useRef(null);

    // Connect at register user
    useEffect(() => {
        if (!linkId || !role) return;

        // ✅ Connect sa socket kung hindi pa connected
        if (!socket.connected) {
            socket.connect();
        }

        // ✅ Register user sa server (gamit ang tamang role)
        socket.emit("register-user", linkId, role);

        console.log(`✅ Socket registered: ${linkId} with role: ${role}`);

        return () => {
            socket.off("maintenance-notifications");
            socket.off("Add_request");
            socket.off("private-alert");
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [linkId, role]);

    // Event listeners
    useEffect(() => {
        if (!linkId || !role) return;

        const handleMaintenanceNotification = (data) => {
            console.log("📢 New maintenance notification:", data);
        };

        const handleAddRequest = (data) => {
            console.log("🆕 New request added:", data);
            
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                console.log("🔄 Fetching display message from Add_request...");
                fetchDisplayMessage();
            }, 300);
        };

        const handlePrivateAlert = (data) => {
            console.log("🔔 Private alert received:", data);
            // Handle private messages
        };

        socket.on("maintenance-notifications", handleMaintenanceNotification);
        socket.on("AyudaCreate", handleAddRequest);
        socket.on("private-alert", handlePrivateAlert);

        console.log(`👂 Listening to socket events for: ${linkId}`);

        return () => {
            socket.off("maintenance-notifications", handleMaintenanceNotification);
            socket.off("AyudaCreate", handleAddRequest);
            socket.off("private-alert", handlePrivateAlert);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [linkId, role, fetchDisplayMessage]);

    return null;
};

export default SocketListener;