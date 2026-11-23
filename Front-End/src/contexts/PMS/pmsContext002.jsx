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

// ============================================================
// 🔧 HELPER — Build query params
// ============================================================
const buildQueryParams = (filters = {}) => {
    const params = {};

    // ✅ all → override lahat ng filters
    if (filters.all) {
        params.all = "true";
        return params;
    }

    if (filters.laboratoryId) params.laboratoryId = filters.laboratoryId;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    return params;
};

export const PMS002Provider = ({ children }) => {
    // ---------------- STATE ----------------
    const [pms002Records, setPms002Records] = useState([]);
    const [pms002Record, setPms002Record] = useState(null);
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
    // POST /api/v1/Pms002
    // ============================================================
    const createPMS002 = async (values) => {
        if (!authToken)
            return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            const payload = {
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
            };

            console.log("📤 createPMS002 payload:", payload);

            const response = await axiosInstance.post(
                `${PMS002_BASE}`,
                payload,
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
    // GET ALL — supports ?laboratoryId, ?from, ?to, ?all
    // GET /api/v1/Pms002
    // ============================================================
    const fetchAllPMS002 = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const params = buildQueryParams(filters);

            const res = await axiosInstance.get(`${PMS002_BASE}`, {
                params,
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            // ✅ Suportahan lahat ng possible response keys
            const records = Array.isArray(res?.data?.pmsRecord002)
                ? res.data.pmsRecord002
                : Array.isArray(res?.data?.pmsRecord)
                ? res.data.pmsRecord
                : Array.isArray(res?.data?.data)
                ? res.data.data
                : [];

            // ✅ Total — server total kung available
            const total =
                typeof res?.data?.totalPMS002 === "number"
                    ? res.data.totalPMS002
                    : typeof res?.data?.total === "number"
                    ? res.data.total
                    : records.length;

            // ✅ Lab data (kung object, hindi array)
            const labData =
                res?.data?.data && !Array.isArray(res.data.data)
                    ? res.data.data
                    : null;

            // ✅ Encharge / performedBy
            const encharge =
                res?.data?.performedBy ||
                res?.data?.laboratory?.performedBy ||
                labData?.performedBy ||
                null;

            setPms002Records(records);
            setServerTotal(total);
            setPerformedBy(encharge);
            if (labData) setMyLaboratory(labData);
            setError(null);

            return {
                success: true,
                data: records,
                pmsRecord002: records,
                pmsRecord: records,
                total,
                performedBy: encharge,
                laboratory: labData,
            };
        } catch (error) {
            const message = handleApiError(error);
            setError(message);
            setPms002Records([]);
            setServerTotal(0);
            setPerformedBy(null);
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
            setPms002Record(null);
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
    // GET /api/v1/Pms002/FindByEquipment?from=&to=&all=&laboratoryId=
    // ============================================================
    const fetchMyLaboratory = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const params = buildQueryParams(filters);

            const res = await axiosInstance.get(
                `${PMS002_BASE}/FindByEquipment`,
                {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                // ✅ Lab info (object, hindi array)
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data || null;

                // ✅ PMS002 records (top-level array)
                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : Array.isArray(res.data.pmsRecord002)
                    ? res.data.pmsRecord002
                    : [];

                // ✅ Total
                const total =
                    typeof res.data.total === "number"
                        ? res.data.total
                        : typeof res.data.totalPMS002 === "number"
                        ? res.data.totalPMS002
                        : pmsRecords.length;

                // ✅ Encharge
                const encharge =
                    labData?.performedBy ||
                    res?.data?.performedBy ||
                    null;

                setMyLaboratory(labData);
                setPms002Records(pmsRecords);
                setServerTotal(total);
                setPerformedBy(encharge);

                return {
                    success: true,
                    data: labData,
                    pmsRecord: pmsRecords,
                    pmsRecord002: pmsRecords,
                    performedBy: encharge,
                    total,
                };
            } else {
                setMyLaboratory(null);
                setPms002Records([]);
                setServerTotal(0);
                setPerformedBy(null);
                return {
                    success: false,
                    error: res?.data?.message || "No laboratory found.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setMyLaboratory(null);
            setPms002Records([]);
            setServerTotal(0);
            setPerformedBy(null);
            return { success: false, error: message };
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
            const payload = {
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
            };

            console.log("📤 updatePMS002 payload:", { id, payload });

            const response = await axiosInstance.put(
                `${PMS002_BASE}/${id}`,
                payload,
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
    // DERIVED — total records (server total kung available)
    // ============================================================
    const totalPMS002 = useMemo(
        () =>
            typeof serverTotal === "number" && serverTotal >= 0
                ? serverTotal
                : pms002Records?.length || 0,
        [serverTotal, pms002Records]
    );

    // ============================================================
    // DERIVED — full name ng performedBy (Encharge)
    // ============================================================
    const performedByFullName = useMemo(() => {
        if (!performedBy) return "";
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
        <PMS002Context.Provider
            value={{
                // state
                pms002Records,
                setPms002Records,
                pms002Record,
                setPms002Record,
                myLaboratory,
                setMyLaboratory,
                performedBy,
                setPerformedBy,
                performedByFullName,

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
                fetchMyLaboratory,
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