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

// ============================================================
// 🔧 HELPER — Build query params for GET requests
// ============================================================
const buildQueryParams = (filters = {}) => {
    const params = {};

    // ✅ Show All — override date filter
    if (filters.all) {
        params.all = "true";
        return params;
    }

    // ✅ Laboratory scope (para sa PMSComponent folder navigation)
    if (filters.laboratoryId) {
        params.laboratoryId = filters.laboratoryId;
    }

    // ✅ Date range filter
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    return params;
};

export const PMS004Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms004Records, setPms004Records] = useState([]);
    const [pms004Record, setPms004Record] = useState(null);
    const [myLaboratory, setMyLaboratory] = useState(null);
    const [performedBy, setPerformedBy] = useState(null);

    // ✅ total from backend (kung available) — fallback sa records.length
    const [serverTotal, setServerTotal] = useState(0);

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
    // GET ALL — supports ?laboratoryId, ?from, ?to, ?all
    // GET /api/v1/Pms004
    // ============================================================
    const fetchAllPMS004 = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const params = buildQueryParams(filters);

            const res = await axiosInstance.get(`${PMS004_BASE}`, {
                params,
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res?.data?.status === "success") {
                const records = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : Array.isArray(res.data.data)
                    ? res.data.data
                    : [];

                const total =
                    typeof res.data.total === "number"
                        ? res.data.total
                        : records.length;

                const labData =
                    res.data.data && !Array.isArray(res.data.data)
                        ? res.data.data
                        : null;

                setPms004Records(records);
                setServerTotal(total);
                if (labData) setMyLaboratory(labData);
                setError(null);

                return {
                    success: true,
                    data: records,
                    pmsRecord: records,
                    total,
                    laboratory: labData,
                };
            } else {
                setPms004Records([]);
                setServerTotal(0);
                return {
                    success: false,
                    error: res?.data?.message || "No records found.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setError(message);
            setPms004Records([]);
            setServerTotal(0);
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
    // GET /api/v1/Pms004/FindByEquipment?from=&to=&all=&laboratoryId=
    // ============================================================
    const fetchMyLaboratory = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const params = buildQueryParams(filters);

            const res = await axiosInstance.get(
                `${PMS004_BASE}/FindByEquipment`,
                {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ Lab info (may kasama nang performedBy)
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data || null;

                // ✅ PMS004 records (top-level array sa response)
                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : [];

                // ✅ Total — mula sa backend kung available
                const total =
                    typeof res.data.total === "number"
                        ? res.data.total
                        : pmsRecords.length;

                // ✅ Encharge info
                const encharge = labData?.performedBy || null;

                setMyLaboratory(labData);
                setPms004Records(pmsRecords);
                setServerTotal(total);
                setPerformedBy(encharge);

                return {
                    success: true,
                    data: labData,
                    pmsRecord: pmsRecords,
                    performedBy: encharge,
                    total,
                };
            } else {
                setMyLaboratory(null);
                setPms004Records([]);
                setServerTotal(0);
                setPerformedBy(null);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            setMyLaboratory(null);
            setPms004Records([]);
            setServerTotal(0);
            setPerformedBy(null);

            const message = handleApiError(error);
            return { success: false, error: message };
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
    // DERIVED — total records (server total kung available)
    // ============================================================
    const totalPMS004 = useMemo(
        () =>
            typeof serverTotal === "number" && serverTotal >= 0
                ? serverTotal
                : pms004Records?.length || 0,
        [serverTotal, pms004Records]
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
                myLaboratory,
                setMyLaboratory,
                performedBy,
                setPerformedBy,
                performedByFullName,

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