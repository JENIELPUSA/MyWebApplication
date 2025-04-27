import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import {io} from 'socket.io-client'
import { PostEmailContext } from "../EmailContext/SendNotificationContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";
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

  const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  useEffect(() => {
    if (!authToken) {
      setRequest([]);
      setLoading(false); // Stop loading when there is no token
      return;
    }
    fetchRequestData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change
  const handlesend = () => {
    triggerSendEmail(
      "Please check your dashboard. A new maintenance request has been submitted and requires your attention."
    );
  };
  const fetchRequestData = async () => {
    if (!authToken) return;
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const requestData = res?.data.data || []; // Ensure it's always an array
      setView(requestData);
      if (role === "admin") {
        const specificAdminMsg = requestData?.filter(
          (msg) => msg?.read === false
        );
        setRequest(requestData);
        setAdminMsg(specificAdminMsg?.length);
      } else if (role === "Technician" || role === "user") {
        const specificMessages = requestData?.filter(
          (msg) => msg?.UserId === userId
        );
        const CountSpecifiData = requestData?.filter(
          (msg) => msg.Status === "Pending" && msg.UserId === userId
        );
        setCountSpecificData(CountSpecifiData?.length);
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
      const response = await axios.post(
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
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      console.log("Response from server:", response);

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        setToAdmin(response.data);
        handlesend();
        fetchRequestData();
        console.log("gegerg", response.data.data);
        socket.on("connect", () => {
          console.log("Connected to socket server:", socket.id);
          socket.emit("newRequest", {
            message: "A new maintenance request!",
            data: response.data.data,
          });
        });
        console.log("TEST #");
        setNewData(response.data.data);
        return { success: true, data: response?.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <RequestDisplayContext.Provider
      value={{
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
