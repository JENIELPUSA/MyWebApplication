// src/components/Context/MaintenanceRequest/MaintenanceRequestContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";
import { MessagePOSTcontext } from "../MessageContext/POSTmessage";

export const MaintenanceRequestContext = createContext();

export const MaintenanceRequestProvider = ({ children }) => {
  const { authToken, role, userId } = useContext(AuthContext);
  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const { fetchDisplayMessage } = useContext(MessagePOSTcontext)

  // ========== TECHNICIAN TASK STATES ==========
  const [technicianTasks, setTechnicianTasks] = useState([]);
  const [technicianTaskSummary, setTechnicianTaskSummary] = useState(null);
  const [technicianTaskLoading, setTechnicianTaskLoading] = useState(false);
  const [technicianTaskError, setTechnicianTaskError] = useState(null);
  // ============================================

  useEffect(() => {
    if (!authToken) {
      setRequest([]);
      setLoading(false);
      return;
    }
    fetchRequestData();
    fetchTechnicianTasks();
  }, [authToken]);

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [customError]);

  const fetchRequestData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      const requestData = res?.data.data || [];
      setView(requestData);
      if (role === "Admin") {

        const specificAdminMsg = requestData?.filter(
          (msg) => msg?.read === false,
        );

        setRequest(requestData);
        setAdminMsg(specificAdminMsg?.length);
      } else if (role === "Technician" || role === "User") {
        const specificMessages = requestData?.filter(
          (msg) => msg.UserId === userId,
        );
        const CountSpecifiData = requestData?.filter(
          (msg) => msg.Status === "Pending" && msg.UserId === userId,
        );
        setRequest(specificMessages);
      }
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ========== TECHNICIAN TASK FUNCTIONS ==========
  const fetchTechnicianTasks = async () => {
    if (!authToken) return;
    setTechnicianTaskLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/MaintenanceTask`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      const data = res?.data?.data || {};
      fetchDisplayMessage();
      fetchRequestData();
      setTechnicianTasks(data.technicians || []);
      setTechnicianTaskSummary(data.summary || null);
      setTechnicianTaskError(null);
    } catch (error) {
      console.error("Failed to fetch technician tasks:", error);
      setTechnicianTaskError("Failed to fetch technician tasks");
      setTechnicianTasks([]);
      setTechnicianTaskSummary(null);
    } finally {
      setTechnicianTaskLoading(false);
    }
  };

  const refreshTechnicianTasks = async () => {
    await fetchTechnicianTasks();
  };
  // ================================================

  const addDescription = async (
    Description,
    equipment,
    Laboratory,
    department,
  ) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest`,
        {
          Description: Description,
          Equipments: equipment,
          Department: department,
          Laboratory: Laboratory,
          Status: "Pending",
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (response.data && response.data.status === "success") {
        fetchRequestData();
        fetchDisplayMessage();
        setModalStatus("success");
        setShowModal(true);
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

  const downloadPMSreport = async (laboratoryId, title) => {
    if (!laboratoryId) return console.error("Laboratory ID is required");

    const endpointMap = {
      "MAINTENANCE SCHEDULE": "DisplayRequestMaintenanceActvity",
      "MAINTENANCE RECORD": "DisplayMaintenanceHistory",
      "TOOLS RECORD": "DisplayToolsandMaintenance",
      "SCHEDULED REPAIR": "DisplayMaintenanceLogs",
      "UNSCHEDULED REPAIR": "DisplayUnscheduledRepair",
    };

    const urlPath = endpointMap[title];

    if (!urlPath) {
      alert("Invalid report type selected.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios({
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${urlPath}?laboratory=${laboratoryId}`,
        method: "GET",
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      const filename = `${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Dili ma-download ang PDF. Siguruha nga naay data para niini nga laboratory.");
    } finally {
      setLoading(false);
    }
  };

  const UpdateAssignTechnician = async ({
    technicianId,
    RequestId, status, remarks, LaboratoryEnchargeId, feedback,
    MessageId = null,
  }) => {

    console.log("Trigger Context", technicianId,
      RequestId, status,
      MessageId = null,)
    try {
      const payload = {
        status, remarks, LaboratoryEnchargeId, feedback,
        technicianId,
        ...(MessageId ? { MessageId } : {}),
      };

      console.log("🔧 Assign Technician");
      console.log("RequestId:", RequestId);
      console.log("Payload:", payload);

      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest/updateDataAssignTechnician/${RequestId}`,
        payload,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (
        response.data?.success ||
        response.data?.status === "success"
      ) {
        const updatedData = response.data.data;
        fetchRequestData();
        fetchDisplayMessage();
        setModalStatus("success");
        setShowModal(true);

        setRequest((prev) =>
          prev.map((item) =>
            item._id === RequestId
              ? updatedData
              : item
          )
        );

        setView((prev) =>
          Array.isArray(prev)
            ? prev.map((item) =>
              item._id === RequestId
                ? updatedData
                : item
            )
            : prev
        );

        // Refresh technician tasks after assignment
        fetchTechnicianTasks();

        return {
          success: true,
          data: updatedData,
        };
      }

      const message =
        response.data?.message ||
        "Failed to assign technician.";

      setModalStatus("failed");
      setShowModal(true);
      setCustomError(message);

      return {
        success: false,
        error: message,
      };
    } catch (error) {
      console.error(
        "❌ UpdateAssignTechnician Error:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unexpected error occurred.";

      setModalStatus("failed");
      setShowModal(true);
      setCustomError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  return (
    <MaintenanceRequestContext.Provider
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
        downloadPMSreport,
        UpdateAssignTechnician,
        // ========== TECHNICIAN TASK EXPORTS ==========
        technicianTasks,
        technicianTaskSummary,
        technicianTaskLoading,
        technicianTaskError,
        fetchTechnicianTasks,
        refreshTechnicianTasks,
        // ============================================
      }}
    >
      {children}

      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </MaintenanceRequestContext.Provider>
  );
};