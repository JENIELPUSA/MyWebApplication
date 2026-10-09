// src/contexts/PMSContext/PMSContext.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const PMSContext = createContext();

// ============================================================
// 🔹 BASE PATH — tugma sa app.use("/api/v1/Pms", ...)
// ============================================================
const PMS_BASE = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Pms`;

export const PMSProvider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pmsRecords, setPmsRecords] = useState([]);
    const [pmsRecord, setPmsRecord] = useState(null);
    const [myLaboratory, setMyLaboratory] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const { authToken } = useContext(AuthContext);

    // ---------------- HELPERS ----------------
    const handleApiError = (error) => {
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            const message =
                typeof errorData === "string"
                    ? errorData
                    : errorData?.message ||
                      errorData.error ||
                      "Something went wrong.";
            setCustomError(message);
            return message;
        } else if (error.request) {
            setCustomError("No response from the server.");
            return "No response from the server.";
        } else {
            setCustomError(error.message || "Unexpected error occurred.");
            return error.message || "Unexpected error occurred.";
        }
    };

    const resetError = () => setError(null);

    // ============================================================
    // CREATE
    // POST /api/v1/Pms
    // ============================================================
    const createPMS = async (values) => {
        if (!authToken) return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            console.log("📤 createPMS payload:", values);

            const response = await axiosInstance.post(
                `${PMS_BASE}`,
                {
                    equipmentId: values.equipmentId,
                    laboratoryId:values.laboratoryId,
                    serviceable: values.serviceable,
                    nonServiceable: values.nonServiceable,
                    type: values.type,
                    breakdownNo: values.breakdownNo,
                    breakdownDuration: values.breakdownDuration,
                    availYes: values.availYes,
                    availNo: values.availNo,
                    remarks: values.remarks,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPmsRecords((prev) => [response.data.data, ...prev]);
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return {
                    success: false,
                    error: "Unexpected response from server.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setModalStatus("failed");
            setShowModal(true);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // GET ALL
    // GET /api/v1/Pms
    // ============================================================
    const fetchAllPMS = async () => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${PMS_BASE}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || [];
            setPmsRecords(data);
            setError(null);
            return { success: true, data };
        } catch (error) {
            const message = handleApiError(error);
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // GET BY ID
    // GET /api/v1/Pms/:id
    // ============================================================
    const fetchPMSById = async (id) => {
        if (!authToken || !id) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${PMS_BASE}/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || null;
            setPmsRecord(data);
            return { success: true, data };
        } catch (error) {
            const message = handleApiError(error);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // GET BY EQUIPMENT ID
    // GET /api/v1/Pms/equipment/:equipmentId
    // ============================================================
    const fetchPMSByEquipmentId = async (equipmentId) => {
        if (!authToken || !equipmentId) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${PMS_BASE}/equipment/${equipmentId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.data || [];
            return { success: true, data };
        } catch (error) {
            const message = handleApiError(error);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // UPDATE
    // PUT /api/v1/Pms/:id
    // ============================================================
    const updatePMS = async (id, values) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            console.log("📤 updatePMS payload:", { id, values });

            const response = await axiosInstance.put(
                `${PMS_BASE}/${id}`,
                {
                    equipmentId: values.equipmentId,
                    serviceable: values.serviceable,
                    nonServiceable: values.nonServiceable,
                    type: values.type,
                    breakdownNo: values.breakdownNo,
                    breakdownDuration: values.breakdownDuration,
                    availYes: values.availYes,
                    availNo: values.availNo,
                    remarks: values.remarks,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPmsRecords((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data.data : item
                    )
                );
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return {
                    success: false,
                    error: "Unexpected response from server.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setModalStatus("failed");
            setShowModal(true);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // DELETE
    // DELETE /api/v1/Pms/:id
    // ============================================================
    const deletePMS = async (id) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            const response = await axiosInstance.delete(
                `${PMS_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPmsRecords((prev) =>
                    prev.filter((item) => item._id !== id)
                );
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return {
                    success: false,
                    error: "Unexpected response from server.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setModalStatus("failed");
            setShowModal(true);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH MY LABORATORY
    // GET /api/v1/Pms/my-laboratory
    // ============================================================
    const fetchMyLaboratory = async () => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${PMS_BASE}/my-laboratory`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success" && res?.data?.data) {
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data;

                setMyLaboratory(labData);
                return { success: true, data: labData };
            } else {
                setMyLaboratory(null);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setMyLaboratory(null);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // DERIVED — total records
    // ============================================================
    const totalPMS = useMemo(() => pmsRecords?.length || 0, [pmsRecords]);

    // ============================================================
    // PROVIDER VALUE
    // ============================================================
    return (
        <PMSContext.Provider
            value={{
                // state
                pmsRecords,
                setPmsRecords,
                pmsRecord,
                setPmsRecord,
                myLaboratory,
                setMyLaboratory,
                loading,
                error,
                customError,
                setCustomError,
                totalPMS,

                // methods
                createPMS,
                fetchAllPMS,
                fetchPMSById,
                fetchPMSByEquipmentId,
                updatePMS,
                deletePMS,
                fetchMyLaboratory,

                // helpers
                resetError,
            }}
        >
            {children}

            <StatusModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </PMSContext.Provider>
    );
};

// Default export
export default PMSProvider;