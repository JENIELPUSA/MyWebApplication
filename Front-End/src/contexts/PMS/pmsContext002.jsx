// src/contexts/PMSContext/PMS002Context.jsx
import React, {
    createContext,
    useState,
    useContext,
    useMemo,
    useCallback,
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
    const [myLaboratory, setMyLaboratory] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    // ✅ FIX: kunin din ang `user` mula sa AuthContext
    const { authToken, user } = useContext(AuthContext);

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

            console.log("response",response)

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
    // GET ALL PMS002
    // GET /api/v1/Pms002
    // ============================================================
    const fetchAllPMS002 = useCallback(
        async (options = {}) => {
            const {
                laboratoryId: explicitLaboratoryId,
                from,
                to,
                forceLaboratoryId,
            } = options;

            if (!authToken) return null;

            const role = user?.role;

            // ✅ Resolve laboratoryId — mula sa explicit, force, o wala
            const resolvedLaboratoryId =
                explicitLaboratoryId || forceLaboratoryId || null;

            // ✅ Admin must pass laboratoryId
            if (role === "Admin" && !resolvedLaboratoryId) {
                const message = "laboratoryId is required for Admin role.";
                setError(message);
                setCustomError(message);
                return { success: false, error: message };
            }

            setLoading(true);

            try {
                const params = {};

                if (from) params.from = from;
                if (to) params.to = to;

                // ✅ PALAGING ipasa ang laboratoryId kung may value
                // (safe kahit User — backend ang mag-o-override gamit ang Encharge)
                if (resolvedLaboratoryId) {
                    params.laboratoryId = resolvedLaboratoryId;
                }

                const res = await axiosInstance.get(`${PMS002_BASE}`, {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                // ✅ Tamang response shape:
                // { status, role, pmsRecord002, totalPMS002, data }
                const records = res?.data?.pmsRecord002 || [];
                const total = res?.data?.totalPMS002 ?? records.length;
                const laboratoryInfo = res?.data?.data || null;

                setPms002Records(records);
                setMyLaboratory(laboratoryInfo);
                setError(null);
                setCustomError("");

                return {
                    success: true,
                    data: records,
                    total,
                    laboratory: laboratoryInfo,
                    role: res?.data?.role,
                };
            } catch (error) {
                const message = handleApiError(error);
                setError(message);
                setPms002Records([]);
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [authToken, user?.role]
    );
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
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success") {
                const labData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data || null;

                const pmsRecords = Array.isArray(res.data.pmsRecord)
                    ? res.data.pmsRecord
                    : [];

                setMyLaboratory(labData);
                setPms002Records(pmsRecords);
                setError(null);

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
            const message = handleApiError(error);
            setMyLaboratory(null);
            setPms002Records([]);
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
                myLaboratory,
                setMyLaboratory,

                loading,
                error,
                customError,
                setCustomError,
                totalPMS002,

                // ✅ user (role) — para sa role checks sa component
                user,

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