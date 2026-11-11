// src/contexts/PMSContext/PMS007Context.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const PMS007Context = createContext();

// ============================================================
// 🔹 BASE PATH — tugma sa app.use("/api/v1/Pms007", ...)
// ============================================================
const PMS007_BASE = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Pms007`;

// ============================================================
// 🔹 HELPER — i-trim ang string values
// ============================================================
const safeString = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).trim();
};

export const PMS007Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms007Records, setPms007Records] = useState([]);
    const [pms007Record, setPms007Record] = useState(null);
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
    // 🔹 PAYLOAD BUILDER — ✅ TUGMA SA PMS007 SCHEMA
    // ============================================================
    const buildPayload = (values) => {
        const payload = {
            laboratoryId: values.laboratoryId,
        };

        // ✅ Optional — PMS007 allows manual entries without equipment
        if (values.equipmentId) {
            payload.equipmentId = values.equipmentId;
        }

        // ✅ Tugma sa schema field names
        const stringFields = [
            "codeNo",
            "instrumentName",
            "instrumentType",
            "accuracy",
            "errorObserved",
            "errorCorrected",
            "calibratedBy",
            "remarks",
            "performedByFullName",
        ];

        stringFields.forEach((field) => {
            if (values[field] !== undefined && values[field] !== null) {
                payload[field] = safeString(values[field]);
            }
        });

        // ✅ date (hindi "maintenanceDate")
        if (values.date) {
            payload.date = values.date;
        }

        return payload;
    };

    // ============================================================
    // CREATE
    // POST /api/v1/Pms007
    // ============================================================
    const createPMS007 = async (values) => {
        if (!authToken)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const payload = buildPayload(values);

            if (import.meta.env.DEV) {
                console.log("🔍 values keys:", Object.keys(values || {}));
                console.log("📤 createPMS007 payload:", payload);
                console.log("📤 payload keys:", Object.keys(payload));
            }

            const response = await axiosInstance.post(
                `${PMS007_BASE}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms007Records((prev) => [response.data.data, ...prev]);
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
    // ✅ GET ALL — may laboratoryId support (para sa PMSComponent)
    // GET /api/v1/Pms007?laboratoryId=...
    //
    // Tugma sa getAllPMS007 controller:
    //   { status, role, totalRecords, data, laboratory }
    // ============================================================
    const fetchAllPMS007 = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        setCustomError("");
        try {
            const params = {};
            if (filters.laboratoryId) {
                params.laboratoryId = filters.laboratoryId;
            }
            if (filters.equipmentId) {
                params.equipmentId = filters.equipmentId;
            }

            if (import.meta.env.DEV) {
                console.log("📤 fetchAllPMS007 params:", params);
            }

            const res = await axiosInstance.get(`${PMS007_BASE}`, {
                params,
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res?.data?.status === "success") {
                // ✅ Controller shape: { status, role, totalRecords, data, laboratory }
                const records = Array.isArray(res.data.data)
                    ? res.data.data
                    : [];

                const labInfo = res.data.laboratory || null;

                setPms007Records(records);
                setMyLaboratory(labInfo);
                setPerformedBy(
                    res.data.performedBy || labInfo?.performedBy || null
                );
                setError(null);

                return {
                    success: true,
                    data: records,
                    totalRecords:
                        res.data.totalRecords ?? records.length,
                    laboratory: labInfo,
                    role: res.data.role,
                    performedBy:
                        res.data.performedBy ||
                        labInfo?.performedBy ||
                        null,
                };
            } else {
                setPms007Records([]);
                setError(
                    res?.data?.message || "Unexpected response from server."
                );
                return {
                    success: false,
                    error:
                        res?.data?.message ||
                        "Unexpected response from server.",
                };
            }
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
    // GET /api/v1/Pms007/:id
    // ============================================================
    const fetchPMS007ById = async (id) => {
        if (!authToken || !id) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(`${PMS007_BASE}/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || null;
            setPms007Record(data);
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
    // GET /api/v1/Pms007?equipmentId=...
    // ============================================================
    const fetchPMS007ByEquipmentId = async (equipmentId) => {
        if (!authToken || !equipmentId) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(
                `${PMS007_BASE}?equipmentId=${equipmentId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.data || [];
            setPms007Records(data);
            return { success: true, data };
        } catch (error) {
            const message = handleApiError(error);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // ✅ FETCH MY LABORATORY
    // GET /api/v1/Pms007/FindByEquipment?from=&to=&all=
    // ============================================================
    const fetchMyLaboratory = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        setCustomError("");
        try {
            const params = {};

            if (filters.all) {
                params.all = "true";
            } else {
                if (filters.from) params.from = filters.from;
                if (filters.to) params.to = filters.to;
            }

            const res = await axiosInstance.get(
                `${PMS007_BASE}/FindByEquipment`,
                {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ data = lab info (object); pmsRecord = PMS007 records (array)
                const labData = res.data.data || null;
                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : [];

                // ✅ performedBy mula sa labData
                const encharge = labData?.performedBy || null;

                setMyLaboratory(labData);
                setPms007Records(pmsRecords);
                setPerformedBy(encharge);

                return {
                    success: true,
                    data: pmsRecords,
                    pmsRecord: pmsRecords, // backward compat
                    laboratory: labData,
                    performedBy: encharge,
                    totalRecords:
                        res.data.totalRecords ?? pmsRecords.length,
                };
            } else {
                setMyLaboratory(null);
                setPms007Records([]);
                setPerformedBy(null);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            setMyLaboratory(null);
            setPms007Records([]);
            setPerformedBy(null);
            const message = handleApiError(error);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // UPDATE
    // PATCH /api/v1/Pms007/:id
    // ============================================================
    const updatePMS007 = async (id, values) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const payload = buildPayload(values);

            if (import.meta.env.DEV) {
                console.log("📤 updatePMS007 payload:", { id, payload });
            }

            const response = await axiosInstance.patch(
                `${PMS007_BASE}/${id}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms007Records((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data.data : item
                    )
                );
                setPms007Record((prev) =>
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
    // DELETE /api/v1/Pms007/:id
    // ============================================================
    const deletePMS007 = async (id) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const response = await axiosInstance.delete(
                `${PMS007_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms007Records((prev) =>
                    prev.filter((item) => item._id !== id)
                );
                setPms007Record((prev) =>
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
    // CLEAR
    // ============================================================
    const clearPMS007 = () => {
        setPms007Records([]);
        setPms007Record(null);
        setMyLaboratory(null);
        setPerformedBy(null);
        setCustomError("");
        setError(null);
    };

    // ============================================================
    // DERIVED
    // ============================================================
    const totalPMS007 = useMemo(
        () => pms007Records?.length || 0,
        [pms007Records]
    );

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
        <PMS007Context.Provider
            value={{
                // state
                pms007Records,
                setPms007Records,
                pms007Record,
                setPms007Record,
                myLaboratory,
                setMyLaboratory,
                performedBy,
                setPerformedBy,
                performedByFullName,

                loading,
                error,
                customError,
                setCustomError,
                totalPMS007,

                // methods
                createPMS007,
                fetchAllPMS007,
                fetchPMS007ById,
                fetchPMS007ByEquipmentId,
                fetchMyLaboratory,
                updatePMS007,
                deletePMS007,
                clearPMS007,

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
        </PMS007Context.Provider>
    );
};

// Default export
export default PMS007Provider;