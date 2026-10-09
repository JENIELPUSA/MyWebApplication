// src/contexts/PMSContext/PMS002Context.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const PMS002Context = createContext();

// ============================================================
// 🔹 BASE PATH — tugma sa app.use("/api/v1/Pms002", ...)
// ============================================================
const PMS002_BASE = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Pms002`;

export const PMS002Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms002Records, setPms002Records] = useState([]);
    const [pms002Record, setPms002Record] = useState(null);
    const [myLaboratory, setMyLaboratory] = useState(null); // ✅ added

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
    // POST /api/v1/Pms002
    // ============================================================
    const createPMS002 = async (values) => {
        if (!authToken) return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            console.log("📤 createPMS002 payload:", values);

            const response = await axiosInstance.post(
                `${PMS002_BASE}`,
                {
                    equipmentId: values.equipmentId,
                    laboratoryId: values.laboratoryId,
                    routineInspection: values.routineInspection,
                    lubrication: values.lubrication,
                    overhauling: values.overhauling,
                    minorAdjustment: values.minorAdjustment,
                    replaceWornOutParts: values.replaceWornOutParts,
                    repair: values.repair,
                    generalRecondition: values.generalRecondition,
                    repairPart: values.repairPart,
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
                setPms002Records((prev) => [response.data.data, ...prev]);
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
    // GET /api/v1/Pms002
    // ============================================================
    const fetchAllPMS002 = async () => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${PMS002_BASE}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || [];
            setPms002Records(data);
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
    // GET /api/v1/Pms002/:id
    // ============================================================
    const fetchPMS002ById = async (id) => {
        if (!authToken || !id) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${PMS002_BASE}/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || null;
            setPms002Record(data);
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
    // GET /api/v1/Pms002/equipment/:equipmentId
    // ============================================================
    const fetchPMS002ByEquipmentId = async (equipmentId) => {
        if (!authToken || !equipmentId) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${PMS002_BASE}/equipment/${equipmentId}`,
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
    // FETCH MY LABORATORY
    // GET /api/v1/Pms002/FindByEquipment?from=&to=&all=
    // ============================================================
    const fetchMyLaboratory = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            // ✅ Buuin ang query params
            const params = {};

            if (filters.all) {
                params.all = "true";
            } else {
                if (filters.from) params.from = filters.from;
                if (filters.to) params.to = filters.to;
            }

            const res = await axiosInstance.get(
                `${PMS002_BASE}/FindByEquipment`,
                {
                    params, // ✅ axios automatic mag-a-append sa URL
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ Laboratory info
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data || null;

                // ✅ PMS002 records (top-level array sa response)
                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : [];

                setMyLaboratory(labData);
                setPms002Records(pmsRecords);

                return {
                    success: true,
                    data: labData,
                    pmsRecord: pmsRecords,
                };
            } else {
                setMyLaboratory(null);
                setPms002Records([]);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message =
                    typeof errorData === "string"
                        ? errorData
                        : errorData?.message ||
                        errorData.error ||
                        "Something went wrong.";
                setCustomError(message);
                setMyLaboratory(null);
                setPms002Records([]);
                return { success: false, error: message };
            } else if (error.request) {
                setCustomError("No response from the server.");
                setMyLaboratory(null);
                setPms002Records([]);
                return {
                    success: false,
                    error: "No response from the server.",
                };
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
                setMyLaboratory(null);
                setPms002Records([]);
                return {
                    success: false,
                    error: error.message || "Unexpected error occurred.",
                };
            }
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // UPDATE
    // PUT /api/v1/Pms002/:id
    // ============================================================
    const updatePMS002 = async (id, values) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            console.log("📤 updatePMS002 payload:", { id, values });

            const response = await axiosInstance.put(
                `${PMS002_BASE}/${id}`,
                {
                    equipmentId: values.equipmentId,
                    laboratoryId: values.laboratoryId,
                    routineInspection: values.routineInspection,
                    lubrication: values.lubrication,
                    overhauling: values.overhauling,
                    minorAdjustment: values.minorAdjustment,
                    replaceWornOutParts: values.replaceWornOutParts,
                    repair: values.repair,
                    generalRecondition: values.generalRecondition,
                    repairPart: values.repairPart,
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
                setPms002Records((prev) =>
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
    // DELETE /api/v1/Pms002/:id
    // ============================================================
    const deletePMS002 = async (id) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            const response = await axiosInstance.delete(
                `${PMS002_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms002Records((prev) =>
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
    // DERIVED — total records
    // ============================================================
    const totalPMS002 = useMemo(
        () => pms002Records?.length || 0,
        [pms002Records]
    );

    // ============================================================
    // PROVIDER VALUE
    // ============================================================
    return (
        <PMS002Context.Provider
            value={{
                // state
                pms002Records,
                setPms002Records,
                pms002Record,
                setPms002Record,
                myLaboratory, // ✅ added
                setMyLaboratory, // ✅ added

                loading,
                error,
                customError,
                setCustomError,
                totalPMS002,

                // methods
                createPMS002,
                fetchAllPMS002,
                fetchPMS002ById,
                fetchPMS002ByEquipmentId,
                fetchMyLaboratory, // ✅ added
                updatePMS002,
                deletePMS002,

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
        </PMS002Context.Provider>
    );
};

// Default export
export default PMS002Provider;