// src/contexts/EquipmentDataContext/EquipmentDataContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const EquipmentDataContext = createContext();

export const EquipmentProvider = ({ children }) => {
    // Fixed: Changed from [""] to [] (empty array)
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEquipments, setTotalEquipments] = useState(0);
    const [TotalAvailableEquipments, setTotalAvailableEquipments] = useState(0);
    const { authToken } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [equipmentsPerPage, setequipmentsPerPage] = useState(6);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchEquipmentData = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const equipmentData = res.data.data || [];

            // Count equipment with status "Available"
            const availableEquipmentCount = equipmentData?.filter(
                (item) => item.status === "Available"
            ).length || 0;

            setTotalAvailableEquipments(availableEquipmentCount);
            setTotalEquipments(equipmentData.length);
            setEquipment(equipmentData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const sendaddEquipment = async (values) => {
        try {
            const response = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment`,
                {
                    Category: values.Category,
                    Specification: values.Specification,
                    Brand: values.Brand,
                    SerialNumber: values.SerialNumber,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (response?.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchEquipmentData(); // ✅ Refresh data after adding
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
                        : errorData?.message || errorData.error || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
            return { success: false, error: customError };
        }
    };

    const EditEquipmentData = async (equipmentID, values) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipmentID}`,
                {
                    Category: values.Category,
                    Specification: values.Specification,
                    Brand: values.Brand,
                    SerialNumber: values.SerialNumber,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (response.data && response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchEquipmentData(); // ✅ Refresh data after editing
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
            return { success: false, error: customError };
        }
    };

    const DeleteDatas = async (equipmentID) => {
        try {
            const response = await axiosInstance.delete(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/delete/${equipmentID}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            if (response.data && response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchEquipmentData(); // ✅ Refresh data after deletion
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            setCustomError("Failed to delete equipment.");
            return { success: false, error: "Failed to delete equipment." };
        }
    };

    return (
        <EquipmentDataContext.Provider
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
                totalEquipments,
                equipment,
                setEquipment,
                loading,
                error,
                fetchEquipmentData,
            }}
        >
            {children}

            <StatusModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </EquipmentDataContext.Provider>
    );
};

// ✅ Add default export
export default EquipmentProvider;