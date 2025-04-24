import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";
export const EquipmentDisplayContext = createContext();

export const EquipmentDisplayProvider = ({ children }) => {
  const [equipment, setEquipment] = useState([""]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [totalEquipments, setTotalEquipments] = useState(0); // Initialize total equipment count
  const [TotalAvailableEquipments, setTotalAvailableEquipments] = useState(0);
  const { authToken } = useContext(AuthContext); // Get token from localStorage
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentsPerPage, setequipmentsPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
const [customError, setCustomError]=useState("")
  useEffect(() => {
    if (!authToken) {
      setEquipment(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }
    fetchEquipmentData();
  }, [authToken]); // Trigger effect when the token changes

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError(null);
      }, 5000); // auto-dismiss after 5s

      return () => clearTimeout(timer); // cleanup
    }
  }, [customError]);

  const fetchEquipmentData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Extract data from response
      const equipmentData = res.data.data;

      // Count equipment with status "Available"
      const availableEquipmentCount = equipmentData?.filter(
        (item) => item.status === "Available"
      ).length;

      // Set total count for available equipment
      setTotalAvailableEquipments(availableEquipmentCount);
      // Set equipment data to state
      setEquipment(equipmentData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };

  const sendaddEquipment = async (values) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment`,
        {
          Category: values.Category, // Send the Category ID directly
          Specification: values.Specification,
          Brand: values.Brand,
          SerialNumber: values.SerialNumber,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
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

  const EditEquipmentData = async (equipmentID, values) => {
    try {
      console.log("gfgfgf", equipmentID, values);
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipmentID}`, // Correctly pass the ID
        {
          Category: values.Category, // Send the category ID
          Specification: values.Specification,
          Brand: values.Brand,
          SerialNumber: values.SerialNumber,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
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
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
      } else if (error.request) {
        // The request was made but no response was received
        setCustomError("No response from the server.");
      } else {
        // Something happened in setting up the request
        setCustomError(error.message || "Unexpected error occurred.");
      }
    }
  };

  const DeleteDatas = async (equipmentID) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipmentID}`,
        {
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
      setCustomError("Error deleting equipment:", error);
      setCustomError("Failed to delete equipment.");
    }
  };

  return (
    <EquipmentDisplayContext.Provider
      value={{
        DeleteDatas,
        EditEquipmentData,
        setCustomError,
        customError,
        sendaddEquipment,
        equipmentsPerPage,
        setequipmentsPerPage,
        setCurrentPage,
        currentPage,
        TotalAvailableEquipments,
        equipment,
        setEquipment,
        loading,
        error,
        totalEquipments,
        fetchEquipmentData,
      }}
    >
      {children}

      {/* Modal should be rendered here */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </EquipmentDisplayContext.Provider>
  );
};
