import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import {io} from 'socket.io-client'
import { PostEmailContext } from "../EmailContext/SendNotificationContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";
import socket from "../../../socket";
export const RequestDisplayContext = createContext();

export const DisplayRequestProvider = ({ children }) => {
  const { triggerSendEmail, setToAdmin } = useContext(PostEmailContext);
  const { authToken, role, userId } = useContext(AuthContext); // Retrieve token from AuthContext
  const [request, setRequest] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  const [unread, setunread] = useState([]);
  const [isNewData, setNewData] = useState();
  const [requestPerPages, setRequestPerPage] = useState(6);
  const [unreadcount, setcountunread] = useState([0]);
  const [CountSpecificData, setCountSpecificData] = useState([]);
  const [AdminMsg, setAdminMsg] = useState([]);
  const [view, setView] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");
 
  useEffect(() => {
    if (!authToken) {
      setRequest([]);
      setLoading(false); // Stop loading when there is no token
      return;
    }
    fetchRequestData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change
  
    useEffect(() => {
      if (customError) {
        const timer = setTimeout(() => {
          setCustomError(null);
        }, 5000); // auto-dismiss after 5s
  
        return () => clearTimeout(timer); // cleanup
      }
    }, [customError]);



  
  const handlesend = () => {
    triggerSendEmail(
      "Please check your dashboard. A new maintenance request has been submitted and requires your attention."
    );
  };



  const fetchRequestData = async () => {
    if (!authToken) return;
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const requestData = res?.data.data || []; // Ensure it's always an array
      setView(requestData);
      if (role === "Admin") {
        const specificAdminMsg = requestData?.filter(
          (msg) => msg?.read === false
        );
        setRequest(requestData);
        setAdminMsg(specificAdminMsg?.length);
      } else if (role === "Technician" || role === "User") {
        const specificMessages = requestData?.filter(
          (msg) => msg?.UserId === userId
        );
        const CountSpecifiData = requestData?.filter(
          (msg) => msg.Status === "Pending" && msg.UserId === userId
        );
        setRequest(specificMessages); // Set the filtered data to state
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Ensure loading is false after fetching
    }
  };

  const addDescription = async (
    Description,
    equipment,
    Laboratory,
    department
  ) => {
    try {
      const response = await axiosInstance.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest`,
        {
          Description: Description,
          Equipments: equipment,
          Department: department,
          Laboratory: Laboratory,
          Status: "Pending",
        },
        { withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        setToAdmin(response.data);
        handlesend();
         socket.emit("RequestMaintenance",response.data.data )  
       
        setNewData(response.data.data);
        return { success: true, data: response?.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
      } else if (error.request) {
        setCustomError("No response from the server.");
      } else {
        setCustomError(error.message || "Unexpected error occurred.");
      }
    }
  };

  return (
    <RequestDisplayContext.Provider
      value={{
        setCountSpecificData,
        setAdminMsg,
        customError,
        view,
        isNewData,
        addDescription,
        AdminMsg,
        CountSpecificData,
        request,
        loading,
        error,
        requestPerPages,
        setRequestPerPage,
        currentPage,
        setCurrentPage,
        setRequest,
        fetchRequestData,
        unread,
        unreadcount,
      }}
    >
      {children}

      {/* Modal should be rendered here */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </RequestDisplayContext.Provider>
  );
};