// src/contexts/PMSContext/PMS005Context.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const PMS005Context = createContext();

// ============================================================
// 🔹 BASE PATH — tugma sa app.use("/api/v1/Pms005", ...)
// ============================================================
const PMS005_BASE = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Pms005`;

// ============================================================
// 🔹 HELPER — i-trim ang string values
// ============================================================
const safeString = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).trim();
};

export const PMS005Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms005Records, setPms005Records] = useState([]);
    const [pms005Record, setPms005Record] = useState(null);
    const [myLaboratory, setMyLaboratory] = useState(null);
    const [performedBy, setPerformedBy] = useState(null);

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

    const resetError = () => {
        setError(null);
        setCustomError("");
    };

    // ============================================================
    // CREATE
    // POST /api/v1/Pms005
    // ============================================================
    const createPMS005 = async (values) => {
        if (!authToken)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            // ✅ Buuin ang payload
            const payload = {
                equipmentId: values.equipmentId,
                laboratoryId: values.laboratoryId,
                Spare_Parts: safeString(values.Spare_Parts),
                Man_hour_used: safeString(values.Man_hour_used),
                Problem_Encounter: safeString(values.Problem_Encounter),
                Date: values.Date || undefined,
            };

            if (import.meta.env.DEV) {
                console.log("📤 createPMS005 payload:", payload);
            }

            const response = await axiosInstance.post(
                `${PMS005_BASE}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms005Records((prev) => [
                    response.data.data,
                    ...prev,
                ]);
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
    // GET /api/v1/Pms005
    // ============================================================
    const fetchAllPMS005 = async () => {
        if (!authToken) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(`${PMS005_BASE}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || [];
            setPms005Records(data);
            setError(null);
            return { success: true, data };
        } catch (error) {
            const message = handleApiError(error);
            setError(message);
            setCustomError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // GET BY ID
    // GET /api/v1/Pms005/:id
    // ============================================================
    const fetchPMS005ById = async (id) => {
        if (!authToken || !id) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(
                `${PMS005_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.data || null;
            setPms005Record(data);
            setError(null);
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
    // GET /api/v1/Pms005/equipment/:equipmentId
    // ============================================================
    const fetchPMS005ByEquipmentId = async (equipmentId) => {
        if (!authToken || !equipmentId) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(
                `${PMS005_BASE}?equipmentId=${equipmentId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.data || [];
            setPms005Records(data);
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
    // GET /api/v1/Pms005/FindByEquipment?from=&to=&all=
    // ============================================================
    const fetchMyLaboratory = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        setCustomError("");
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
                `${PMS005_BASE}/FindByEquipment`,
                {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ Laboratory info (may kasama nang performedBy)
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data || null;

                // ✅ PMS005 records (top-level array sa response)
                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : [];

                // ✅ Kunin ang performedBy mula sa labData
                const encharge = labData?.performedBy || null;

                setMyLaboratory(labData);
                setPms005Records(pmsRecords);
                setPerformedBy(encharge);

                return {
                    success: true,
                    data: labData,
                    pmsRecord: pmsRecords,
                    performedBy: encharge,
                };
            } else {
                setMyLaboratory(null);
                setPms005Records([]);
                setPerformedBy(null);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            setMyLaboratory(null);
            setPms005Records([]);
            setPerformedBy(null);
            const message = handleApiError(error);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // UPDATE
    // PUT /api/v1/Pms005/:id
    // ============================================================
    const updatePMS005 = async (id, values) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const payload = {
                equipmentId: values.equipmentId,
                laboratoryId: values.laboratoryId,
                Spare_Parts: safeString(values.Spare_Parts),
                Man_hour_used: safeString(values.Man_hour_used),
                Problem_Encounter: safeString(values.Problem_Encounter),
                Date: values.Date || undefined,
            };

            if (import.meta.env.DEV) {
                console.log("📤 updatePMS005 payload:", { id, payload });
            }

            const response = await axiosInstance.put(
                `${PMS005_BASE}/${id}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms005Records((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data.data : item
                    )
                );
                setPms005Record((prev) =>
                    prev && prev._id === id ? response.data.data : prev
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
    // DELETE /api/v1/Pms005/:id
    // ============================================================
    const deletePMS005 = async (id) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const response = await axiosInstance.delete(
                `${PMS005_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms005Records((prev) =>
                    prev.filter((item) => item._id !== id)
                );
                setPms005Record((prev) =>
                    prev && prev._id === id ? null : prev
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
    // CLEAR — i-reset lahat ng state
    // ============================================================
    const clearPMS005 = () => {
        setPms005Records([]);
        setPms005Record(null);
        setMyLaboratory(null);
        setPerformedBy(null);
        setCustomError("");
        setError(null);
    };

    // ============================================================
    // DERIVED — total records
    // ============================================================
    const totalPMS005 = useMemo(
        () => pms005Records?.length || 0,
        [pms005Records]
    );

    // ============================================================
    // DERIVED — full name ng performedBy
    // ============================================================
    const performedByFullName = useMemo(() => {
        if (!performedBy) return "";
        if (typeof performedBy === "string") return performedBy;
        return [
            performedBy.FirstName,
            performedBy.Middle,
            performedBy.LastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();
    }, [performedBy]);

    // ============================================================
    // PROVIDER VALUE
    // ============================================================
    return (
        <PMS005Context.Provider
            value={{
                // state
                pms005Records,
                setPms005Records,
                pms005Record,
                setPms005Record,
                myLaboratory,
                setMyLaboratory,
                performedBy,
                setPerformedBy,
                performedByFullName,

                loading,
                error,
                customError,
                setCustomError,
                totalPMS005,

                // methods
                createPMS005,
                fetchAllPMS005,
                fetchPMS005ById,
                fetchPMS005ByEquipmentId,
                fetchMyLaboratory,
                updatePMS005,
                deletePMS005,
                clearPMS005,

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
        </PMS005Context.Provider>
    );
};

// Default export
export default PMS005Provider;