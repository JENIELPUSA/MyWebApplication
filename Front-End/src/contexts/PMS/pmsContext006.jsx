// src/contexts/PMSContext/PMS006Context.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const PMS006Context = createContext();

// ============================================================
// 🔹 BASE PATH — tugma sa app.use("/api/v1/Pms006", ...)
// ============================================================
const PMS006_BASE = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Pms006`;

// ============================================================
// 🔹 HELPER — i-trim ang string values
// ============================================================
const safeString = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).trim();
};

export const PMS006Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms006Records, setPms006Records] = useState([]);
    const [pms006Record, setPms006Record] = useState(null);
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
    // 🔹 PAYLOAD BUILDER — ✅ TUGMA SA SCHEMA (camelCase)
    // ============================================================
    const buildPayload = (values) => {
        const payload = {
            equipmentId: values.equipmentId,
            laboratoryId: values.laboratoryId,
        };

        // ✅ Tugma sa schema field names
        const stringFields = [
            "analysisTrouble",
            "adjustmentSetting",
            "manHourUse",
            "counterMeasures",
            "improvementRepairProcedure",
            "sparePartsMaterialsUsed",
            "incharge",
            "performedByFullName",
        ];

        stringFields.forEach((field) => {
            if (values[field] !== undefined && values[field] !== null) {
                payload[field] = safeString(values[field]);
            }
        });

        // ✅ maintenanceDate (hindi "Date")
        if (values.maintenanceDate) {
            payload.maintenanceDate = values.maintenanceDate;
        }

        return payload;
    };

    // ============================================================
    // CREATE
    // POST /api/v1/Pms006
    // ============================================================
    const createPMS006 = async (values) => {
        if (!authToken)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const payload = buildPayload(values);

            if (import.meta.env.DEV) {
                console.log("🔍 values keys:", Object.keys(values || {}));
                console.log("📤 createPMS006 payload:", payload);
                console.log("📤 payload keys:", Object.keys(payload));
            }

            const response = await axiosInstance.post(
                `${PMS006_BASE}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms006Records((prev) => [response.data.data, ...prev]);
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
    // GET /api/v1/Pms006?laboratoryId=...
    //
    // Tugma sa bagong getAllPMS006 controller:
    //   { status, role, totalRecords, data, laboratory, performedBy? }
    // ============================================================
    const fetchAllPMS006 = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        setCustomError("");
        try {
            const params = {};
            if (filters.laboratoryId) {
                params.laboratoryId = filters.laboratoryId;
            }

            if (import.meta.env.DEV) {
                console.log("📤 fetchAllPMS006 params:", params);
            }

            const res = await axiosInstance.get(`${PMS006_BASE}`, {
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

                setPms006Records(records);
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
                setPms006Records([]);
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
    // GET /api/v1/Pms006/:id
    // ============================================================
    const fetchPMS006ById = async (id) => {
        if (!authToken || !id) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(`${PMS006_BASE}/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = res?.data?.data || null;
            setPms006Record(data);
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
    // GET /api/v1/Pms006?equipmentId=...
    // ============================================================
    const fetchPMS006ByEquipmentId = async (equipmentId) => {
        if (!authToken || !equipmentId) return null;
        setLoading(true);
        setCustomError("");
        try {
            const res = await axiosInstance.get(
                `${PMS006_BASE}?equipmentId=${equipmentId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.data || [];
            setPms006Records(data);
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
    // GET /api/v1/Pms006/FindByEquipment?from=&to=&all=
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
                `${PMS006_BASE}/FindByEquipment`,
                {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ data = PMS006 records (array)
                const pmsRecords = Array.isArray(res.data.data)
                    ? res.data.data
                    : [];

                // ✅ laboratory = lab info (object)
                const labData = res.data.laboratory || null;

                // ✅ performedBy mula sa labData (kung available)
                const encharge = labData?.performedBy || null;

                setMyLaboratory(labData);
                setPms006Records(pmsRecords);
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
                setPms006Records([]);
                setPerformedBy(null);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            setMyLaboratory(null);
            setPms006Records([]);
            setPerformedBy(null);
            const message = handleApiError(error);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // UPDATE
    // PATCH /api/v1/Pms006/:id
    // ============================================================
    const updatePMS006 = async (id, values) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const payload = buildPayload(values);

            if (import.meta.env.DEV) {
                console.log("📤 updatePMS006 payload:", { id, payload });
            }

            const response = await axiosInstance.patch(
                `${PMS006_BASE}/${id}`,
                payload,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms006Records((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data.data : item
                    )
                );
                setPms006Record((prev) =>
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
    // DELETE /api/v1/Pms006/:id
    // ============================================================
    const deletePMS006 = async (id) => {
        if (!authToken || !id)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        setCustomError("");
        try {
            const response = await axiosInstance.delete(
                `${PMS006_BASE}/${id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setPms006Records((prev) =>
                    prev.filter((item) => item._id !== id)
                );
                setPms006Record((prev) =>
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
    const clearPMS006 = () => {
        setPms006Records([]);
        setPms006Record(null);
        setMyLaboratory(null);
        setPerformedBy(null);
        setCustomError("");
        setError(null);
    };

    // ============================================================
    // DERIVED
    // ============================================================
    const totalPMS006 = useMemo(
        () => pms006Records?.length || 0,
        [pms006Records]
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
        <PMS006Context.Provider
            value={{
                // state
                pms006Records,
                setPms006Records,
                pms006Record,
                setPms006Record,
                myLaboratory,
                setMyLaboratory,
                performedBy,
                setPerformedBy,
                performedByFullName,

                loading,
                error,
                customError,
                setCustomError,
                totalPMS006,

                // methods
                createPMS006,
                fetchAllPMS006,
                fetchPMS006ById,
                fetchPMS006ByEquipmentId,
                fetchMyLaboratory,
                updatePMS006,
                deletePMS006,
                clearPMS006,

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
        </PMS006Context.Provider>
    );
};

// Default export
export default PMS006Provider;