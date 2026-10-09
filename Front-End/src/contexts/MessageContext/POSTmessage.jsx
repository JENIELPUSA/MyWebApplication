import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

// Create Context
export const MessagePOSTcontext = createContext();

export const MessagePostProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [SendPost, setSendPost] = useState(null);
  const [SendPatch, setSendPatch] = useState(null);
  const [sendMsg, setSendMsg] = useState(null);

  // State para sa DisplayMessage
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalMessagePending, setTotalMessagePending] = useState(0);

  // Fetch DisplayMessage function
  const fetchDisplayMessage = useCallback(async (queryParams = "") => {
    if (!authToken) {
      console.log("No auth token available");
      return;
    }

    setLoadingMessages(true);
    setMessageError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest${queryParams}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data?.status === "success") {
        setMessages(response.data.data || []);
        setTotalMessages(response.data.totalMessages || 0);
        setTotalMessagePending(response.data.totalMessagePending || 0);

        console.log("Messages fetched successfully:", response.data.data?.length);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessageError(error.response?.data?.message || "Failed to fetch messages");
      setMessages([]);
      setTotalMessages(0);
      setTotalMessagePending(0);
    } finally {
      setLoadingMessages(false);
    }
  }, [authToken]);

  // Auto-fetch messages kapag may authToken
  useEffect(() => {
    if (authToken) {
      fetchDisplayMessage();
    }
  }, [authToken, fetchDisplayMessage]);

  // Fetch with filter (e.g., status, date, etc.)
  const fetchMessagesWithFilter = useCallback(async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const query = queryString ? `?${queryString}` : "";
    return await fetchDisplayMessage(query);
  }, [fetchDisplayMessage]);

  // Refresh messages (para gamitin after mag-send ng new message)
  const refreshMessages = useCallback(async () => {
    return await fetchDisplayMessage();
  }, [fetchDisplayMessage]);

  // useEffect for SendPost
  useEffect(() => {
    if (SendPost) {
      fetchsendPost();
    }
  }, [SendPost]);

  // useEffect for SendPatch
  useEffect(() => {
    if (SendPatch) {
      updatesendPost();
    }
  }, [SendPatch]);

  // useEffect for sendMsg
  useEffect(() => {
    if (sendMsg) {
      updatesendMsg();
    }
  }, [sendMsg]);

  // Function to send a new maintenance request
  const fetchsendPost = async () => {
    if (!SendPost) return;

    try {
      const enchargeId = SendPost.data.Technician;

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        {
          Status: SendPost.Status,
          role: SendPost?.role,
          message: SendPost.message,
          Laboratory: SendPost.data.Laboratory,
          Encharge: SendPost.data.Technician,
          RequestID: SendPost.data._id,
          types: "AssignedTechnician",
          viewers: enchargeId
            ? [
              {
                user: enchargeId,
                isRead: false,
              },
            ]
            : [],
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (response.data?.status === "success") {
        console.log("Message successfully sent and viewers set:", response.data.data);
        // Auto-refresh messages after sending
        await refreshMessages();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to update maintenance request
  const updatesendPost = async () => {
    if (!SendPatch) return;

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${SendPatch}`,
        { Status: "Under Maintenance" },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (response.data?.status === "success") {
        console.log("Request updated successfully:", response.data.data);
        // Auto-refresh messages after update
        await refreshMessages();
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  // Function to update message request
  const updatesendMsg = async () => {
    if (!sendMsg) return;

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${sendMsg}`,
        { Status: "Accepted" },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      if (response.status === 200) {
        console.log("Message successfully updated:", response.data.data);
        // Auto-refresh messages after update
        await refreshMessages();
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  // Function to mark ALL messages as read (BATCH)
  const markAllAsRead = useCallback(async (messageIds = []) => {
    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/mark-all-read`,
        { messageIds }, // body — ipapasa sa backend
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data?.status === "success") {
        const updatedIds = response.data.updatedIds || messageIds;

        setMessages(prevMessages =>
          prevMessages.map(msg =>
            updatedIds.includes(msg._id)
              ? { ...msg, read: true, readonUser: true }
              : msg
          )
        );
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      throw error;
    }
  }, [authToken]);

  // Get unread messages count
  const getUnreadCount = useCallback(() => {
    return messages.filter(msg => !msg.read).length;
  }, [messages]);

  return (
    <MessagePOSTcontext.Provider
      value={{
        // Original functions
        setSendMsg,
        setSendPatch,
        setSendPost, markAllAsRead,
        // DisplayMessage functions
        messages,
        setMessages,
        loadingMessages,
        messageError,
        totalMessages,
        totalMessagePending,
        fetchDisplayMessage,
        fetchMessagesWithFilter,
        refreshMessages,
        markAllAsRead,
        getUnreadCount,
      }}
    >
      {children}
    </MessagePOSTcontext.Provider>
  );
};