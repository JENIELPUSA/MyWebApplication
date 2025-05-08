import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext"; // Import AuthContext
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";

//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";
export const LaboratoryDisplayContext = createContext();

export const LaboratoryDisplayProvider = ({ children }) => {
  const [customError, setCustomError] = useState("");
  const { authToken } = useContext(AuthContext); // Access token from AuthContext
  const [laboratories, setLaboratories] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [laboratoryPerPage, setLaboratoryPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  
  useEffect(() => {
    if (!authToken) {
      setLaboratories([]);
      setLoading(false);
      return;
    }

    fetchLaboratoryData();
  }, [authToken]); // Trigger when token, page or items per page change

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError(null);
      }, 5000); // auto-dismiss after 5s

      return () => clearTimeout(timer); // cleanup
    }
  }, [customError]);

  const fetchLaboratoryData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory`, {
        headers: {
          withCredentials: true ,Authorization: `Bearer ${authToken}`, // Include the token in headers
        },
      });

      const laboratoryData = res?.data.data;
      setLaboratories(laboratoryData);
    } catch (error) {
      if (error.response?.status === 401) {
        // Handle Unauthorized error
        setCustomError("Unauthorized: Please log in again.");
        setCustomError("Unauthorized: Please log in again.");
      } else {
        setCustomError("Error fetching data:", error);
        setCustomError("Failed to fetch data. Please try again later.");
        setCustomError("Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  const AddedLaboratory = async (values) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory`,
        {
          department: values.department,
          Encharge: values.Encharge,
          LaboratoryName: values.LaboratoryName,
        },
        {withCredentials: true , headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        //para maka send pabalik sa component
        return { success: true, data: response.data.data };
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

  const UpdateLaboratory = async (LaboratoryId, values) => {
    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/${LaboratoryId}`,
        {
          department: values.department,
          Encharge: values.Encharge,
          LaboratoryName: values.LaboratoryName,
        },
        { withCredentials: true ,headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        //para maka send pabalik sa component
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      setCustomError("There was an error:", error);
      setCustomError(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    }
  };

  const DeleteLaboratory = async (laboratoryId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/${laboratoryId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete Laboratory.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };


  return (
    <LaboratoryDisplayContext.Provider
      value={{
        DeleteLaboratory,
        UpdateLaboratory,
        customError,
        AddedLaboratory,
        laboratories,
        loading,
        error,
        setLaboratories,
        setLaboratoryPerPage,
        laboratoryPerPage,
        currentPage,
        setCurrentPage,
        fetchLaboratoryData,
      }}
    >
      {children}

      {/* Modal should be rendered here */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </LaboratoryDisplayContext.Provider>
  );
  
};
