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

    //  BAGONG STATE para sa displayAllPMS001
    const [displayAllRecords, setDisplayAllRecords] = useState([]);

    // ✅ BAGONG STATE para sa Departments → Labs → PMS001
    const [departmentsWithLabs, setDepartmentsWithLabs] = useState([]);

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
                    laboratoryId: values.laboratoryId,
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

            console.log("response", response);

            if (response?.status === "success" || 207) {
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
    // Helper — Build query params for GET requests
    // ============================================================
    const buildQueryParams = (filters = {}) => {
        const params = {};

        // ✅ Show All — override date filter
        if (filters.all) {
            params.all = "true";
        } else {
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;
        }

        // ✅ Laboratory scope (para sa Admin)
        if (filters.laboratoryId) {
            params.laboratoryId = filters.laboratoryId;
        }

        return params;
    };

    // ============================================================
    // GET ALL — PMS001
    // GET /api/v1/Pms?laboratoryId=xxx&from=...&to=...&all=true
    // ============================================================
    const fetchAllPMS = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const params = buildQueryParams(filters);

            const res = await axiosInstance.get(`${PMS_BASE}`, {
                params, // ✅ axios automatic mag-a-append sa URL
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res?.data?.status === "success") {
                // ✅ Records — array
                const records = Array.isArray(res.data.data)
                    ? res.data.data
                    : [];

                // ✅ totalRecords — mula sa backend kung available
                const total =
                    typeof res.data.totalRecords === "number"
                        ? res.data.totalRecords
                        : records.length;

                // ✅ Laboratory info (may `_id`, `LaboratoryName`, optional `performedBy`)
                const laboratory = res.data.laboratory || null;

                // ✅ Role (kung ibinalik ng backend)
                const role = res.data.role || null;

                setPmsRecords(records);
                setError(null);

                return {
                    success: true,
                    data: records,
                    pmsRecord: records, // alias
                    total,
                    laboratory,
                    role,
                };
            } else {
                setPmsRecords([]);
                return {
                    success: false,
                    error: res?.data?.message || "No records found.",
                };
            }
        } catch (error) {
            const message = handleApiError(error);
            setError(message);
            setPmsRecords([]);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const displayAllPMS001 = async ({ from, to, laboratoryId } = {}) => {
        if (!authToken) return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            const params = {};
            if (from) params.from = from;
            if (to) params.to = to;
            if (laboratoryId) params.laboratoryId = laboratoryId;   // ✅ Idinagdag

            const res = await axiosInstance.get(
                `${PMS_BASE}`,
                {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.pmsRecord || [];

            //SARILING SETTER — hindi ginagalaw ang pmsRecords
            setDisplayAllRecords(data);

            setError(null);
            return {
                success: true,
                data,
                laboratory: res?.data?.data || null,
                role: res?.data?.role || null,   // ✅ Ibalik ang role para reference
            };
        } catch (error) {
            const message = handleApiError(error);
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // ✅ GET DEPARTMENTS → LABORATORIES → PMS001
    // GET /api/v1/Pms/getDepartmentsWithLabEquipments
    // (walang param — lahat ng departments)
    // ============================================================
    const fetchDepartmentsWithLabEquipments = async () => {
        if (!authToken) return { success: false, error: "Not authenticated." };
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${PMS_BASE}/getDepartmentsWithLabEquipments`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = res?.data?.data || [];
            setDepartmentsWithLabs(data);
            setError(null);

            return {
                success: true,
                data,
                totalDepartments: res?.data?.totalDepartments || data.length,
            };
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

    const totalPMS = useMemo(() => pmsRecords?.length || 0, [pmsRecords]);

    const totalDisplayAll = useMemo(
        () => displayAllRecords?.length || 0,
        [displayAllRecords]
    );

    // ✅ Total ng departments na may labs
    const totalDepartmentsWithLabs = useMemo(
        () => departmentsWithLabs?.length || 0,
        [departmentsWithLabs]
    );

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
                displayAllRecords,
                setDisplayAllRecords,
                totalDisplayAll,

                // ✅ BAGONG STATE
                departmentsWithLabs,
                setDepartmentsWithLabs,
                totalDepartmentsWithLabs,

                loading,
                error,
                customError,
                setCustomError,
                totalPMS,

                // methods
                createPMS,
                fetchAllPMS,
                displayAllPMS001,
                fetchDepartmentsWithLabEquipments, // ✅ BAGONG METHOD
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