// src/contexts/PMSContext/PMS004Context.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const PMS004Context = createContext();

// ============================================================
// 🔹 BASE PATH — tugma sa app.use("/api/v1/Pms004", ...)
// ============================================================
const PMS004_BASE = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Pms004`;

// ============================================================
// 🔧 HELPER — Convert incoming values to strict boolean
// ============================================================
const toBool = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
        const v = val.trim().toLowerCase();
        return v === "true" || v === "1" || v === "yes" || v === "on";
    }
    if (typeof val === "number") return val === 1;
    return false;
};

// ✅ Listahan ng boolean fields sa schema (4 na lang)
const BOOLEAN_FIELDS = [
    "routineInspection",
    "lubrication",
    "minorAdjustment",
    "repair",
];

// I-normalize lahat ng boolean fields sa isang payload object
const normalizeBooleans = (values = {}) => {
    const normalized = {};
    BOOLEAN_FIELDS.forEach((field) => {
        normalized[field] = toBool(values[field]);
    });
    return normalized;
};

export const PMS004Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms004Records, setPms004Records] = useState([]);
    const [pms004Record, setPms004Record] = useState(null);
    const [myLaboratory, setMyLaboratory] = useState(null); // ✅ added
    const [performedBy, setPerformedBy] = useState(null); // ✅ NEW — Encharge info

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
    // POST /api/v1/Pms004
    // ============================================================
    const createPMS004 = async (values) => {
        if (!authToken) return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            // ✅ Normalize booleans bago ipadala
            const payload = {
                equipmentId: values.equipmentId,
                laboratoryId: values.laboratoryId,
                ...normalizeBooleans(values),
            };

            console.log("📤 createPMS004 payload:", payload);

            const response = await axiosInstance.post(
                `${PMS004_BASE}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms004Records((prev) => [response.data.data, ...prev]);
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
    // GET /api/v1/Pms004
    // ============================================================
    const fetchAllPMS004 = async () => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${PMS004_BASE}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || [];
            setPms004Records(data);
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
    // GET /api/v1/Pms004/:id
    // ============================================================
    const fetchPMS004ById = async (id) => {
        if (!authToken || !id) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${PMS004_BASE}/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || null;
            setPms004Record(data);
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
    // GET /api/v1/Pms004/equipment/:equipmentId
    // ============================================================
    const fetchPMS004ByEquipmentId = async (equipmentId) => {
        if (!authToken || !equipmentId) return null;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${PMS004_BASE}/equipment/${equipmentId}`,
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
    // GET /api/v1/Pms004/FindByEquipment?from=&to=&all=
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
                `${PMS004_BASE}/FindByEquipment`,
                {
                    params, // ✅ axios automatic mag-a-append sa URL
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ Laboratory info (may kasama nang performedBy)
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data || null;

                // ✅ PMS004 records (top-level array sa response)
                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : [];

                // ✅ Kunin ang performedBy mula sa labData
                const encharge = labData?.performedBy || null;

                setMyLaboratory(labData);
                setPms004Records(pmsRecords);
                setPerformedBy(encharge); // ✅ i-save sa state

                return {
                    success: true,
                    data: labData,
                    pmsRecord: pmsRecords,
                    performedBy: encharge, // ✅ convenient access
                };
            } else {
                setMyLaboratory(null);
                setPms004Records([]);
                setPerformedBy(null); // ✅ clear
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            setMyLaboratory(null);
            setPms004Records([]);
            setPerformedBy(null); // ✅ clear

            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message =
                    typeof errorData === "string"
                        ? errorData
                        : errorData?.message ||
                        errorData.error ||
                        "Something went wrong.";
                setCustomError(message);
                return { success: false, error: message };
            } else if (error.request) {
                setCustomError("No response from the server.");
                return {
                    success: false,
                    error: "No response from the server.",
                };
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
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
    // PUT /api/v1/Pms004/:id
    // ============================================================
    const updatePMS004 = async (id, values) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            // ✅ Normalize booleans bago ipadala
            const payload = {
                equipmentId: values.equipmentId,
                laboratoryId: values.laboratoryId,
                ...normalizeBooleans(values),
            };

            console.log("📤 updatePMS004 payload:", { id, payload });

            const response = await axiosInstance.put(
                `${PMS004_BASE}/${id}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms004Records((prev) =>
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
    // DELETE /api/v1/Pms004/:id
    // ============================================================
    const deletePMS004 = async (id) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            const response = await axiosInstance.delete(
                `${PMS004_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms004Records((prev) =>
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
    const totalPMS004 = useMemo(
        () => pms004Records?.length || 0,
        [pms004Records]
    );

    // ============================================================
    // DERIVED — full name ng performedBy (Encharge)
    // ============================================================
    const performedByFullName = useMemo(() => {
        if (!performedBy) return "";
        return [performedBy.FirstName, performedBy.Middle, performedBy.LastName]
            .filter(Boolean)
            .join(" ")
            .trim();
    }, [performedBy]);

    // ============================================================
    // PROVIDER VALUE
    // ============================================================
    return (
        <PMS004Context.Provider
            value={{
                // state
                pms004Records,
                setPms004Records,
                pms004Record,
                setPms004Record,
                myLaboratory, // ✅ added
                setMyLaboratory, // ✅ added
                performedBy, // ✅ NEW — Encharge user info
                setPerformedBy, // ✅ NEW
                performedByFullName, // ✅ NEW — "FirstName Middle LastName"

                loading,
                error,
                customError,
                setCustomError,
                totalPMS004,

                // methods
                createPMS004,
                fetchAllPMS004,
                fetchPMS004ById,
                fetchPMS004ByEquipmentId,
                fetchMyLaboratory,
                updatePMS004,
                deletePMS004,

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
        </PMS004Context.Provider>
    );
};

// Default export
export default PMS004Provider;