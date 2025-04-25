import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserDisplayContext } from "../User/DisplayUser";
import "react-toastify/dist/ReactToastify.css";

export const PostEmailContext = createContext();

export const AddEmailProvider = ({ children }) => {
  const [toTechnician, setToTechnician] = useState(null);
  const [toAdmin, setToAdmin] = useState(null);
  const token = localStorage.getItem("token");
  const { users } = useContext(UserDisplayContext);
  const [Msg, setSendMsg] = useState(null); // Message to send
  const [triggerEmail, setTriggerEmail] = useState(false); // Trigger email sending manually
  const [isEmail, setIsEmail] = useState([]); // Initializing isEmail as an empty array to avoid undefined errors
  const [isSending, setIsSending] = useState(false); // State to track if an email is currently being sent

  // Effect to update email list based on technician data or admin users
  useEffect(() => {
    const updateEmailList = () => {
      if (toTechnician) {
        const TechId = toTechnician?.data.Technician;
        const filteredUsers = users?.filter(user => TechId.includes(user._id) && user.role === "Technician");
        const TechEmail = filteredUsers?.map(tech => tech.email);
        setIsEmail(TechEmail);
        console.log("Technician Emails:", TechEmail);
      } else if (toAdmin) {
        const adminUsers = users?.filter(user => user.role === "admin");
        const adminEmail = adminUsers?.map(admin => admin.email);
        setIsEmail(adminEmail);
        console.log("Admin Emails:", adminEmail);
      }
    };

    updateEmailList();
  }, [toTechnician, toAdmin, users]);

  // Function to send emails
  const SendEmailPost = useCallback(async () => {
    if (!Msg || isEmail?.length === 0 || isSending) {
      console.log("No message or no emails to send, or currently sending");
      return; // Exit if no message or no emails or already sending
    }

    setIsSending(true); // Mark as sending

    const resetUrl = `https://my-web-application-one.vercel.app/login`;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/emailSend`,
        {
          emails: isEmail,
          message: `${Msg}.\nClick to login: ${resetUrl}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSendMsg(null); // Reset message after sending
      setIsEmail([]); // Reset emails list after sending
    } catch (error) {
      console.error("Error sending emails:", error.response || error);
      toast.error(`Error sending emails: ${error.message || error}`);
    } finally {
      setIsSending(false); // Mark as not sending again
    }
  }, [Msg, isEmail, token, isSending]);

  // Effect to trigger email sending when Msg or triggerEmail changes
  useEffect(() => {
    if (triggerEmail && Msg && isEmail?.length > 0) {
      SendEmailPost();
      setTriggerEmail(false); // Reset trigger after sending
    }
  }, [Msg, triggerEmail, isEmail]);

  const triggerSendEmail = (message) => {
    setSendMsg(message); // Set the message
    setTriggerEmail(true); // Trigger the email send
  };

  return (
    <PostEmailContext.Provider value={{ setToAdmin, setToTechnician, triggerSendEmail }}>
      {children}
    </PostEmailContext.Provider>
  );
};
