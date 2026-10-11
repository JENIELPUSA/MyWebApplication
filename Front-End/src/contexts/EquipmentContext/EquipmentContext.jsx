// src/contexts/EquipmentDataContext/EquipmentDataContext.jsx
import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useMemo,
    useCallback,
} from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const EquipmentDataContext = createContext();

export const EquipmentProvider = ({ children }) => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEquipments, setTotalEquipments] = useState(0);
    const [TotalAvailableEquipments, setTotalAvailableEquipments] = useState(0);
    const { authToken } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [equipmentsPerPage, setequipmentsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");
    const [PmsRecord, setPmsRecord] = useState([]);

    // 🔹 Search, filter, single fetch
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentById, setEquipmentById] = useState(null);
    const [equipmentByCode, setEquipmentByCode] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(""); // ✅ NEW

    // Laboratory info ng naka-login na user (FindByEquipment)
    const [myLaboratory, setMyLaboratory] = useState(null);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    // ============================================================
    // DEBOUNCE SEARCH — 400ms delay
    // ============================================================
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // ✅ Reset sa page 1 kapag nag-search
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ✅ Reset sa page 1 kapag nag-change ang status filter
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    // ✅ Reset sa page 1 kapag nag-change ang category filter
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter]);

    // ============================================================
    // FETCH EQUIPMENT DATA (may pagination + filters)
    // ============================================================
    const fetchEquipmentData = useCallback(
        async (signal) => {
            if (!authToken) return;

            try {
                setLoading(true);

                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment`,
                    {
                        params: {
                            page: currentPage,
                            limit: equipmentsPerPage,
                            search: debouncedSearch,
                            // ✅ Status filter (server-side)
                            ...(statusFilter && { status: statusFilter }),
                            // ✅ Category filter (server-side, ObjectId)
                            ...(categoryFilter && { category: categoryFilter }),
                        },
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Cache-Control": "no-cache",
                        },
                        signal,
                    }
                );

                // Support both new (totalRecords) at old (totalEquipment) keys
                const total =
                    response.data.totalRecords ??
                    response.data.totalEquipment ??
                    0;
                const pages =
                    response.data.totalPages ??
                    Math.ceil(total / equipmentsPerPage);

                const equipmentData = response.data.data || [];

                // Count equipment with status "Available" sa current page
                const availableEquipmentCount =
                    equipmentData.filter(
                        (item) => item.status === "Available"
                    ).length || 0;

                setPmsRecord(response.data.pmsRecord || []);
                setTotalAvailableEquipments(availableEquipmentCount);
                setTotalEquipments(total);
                setTotalPages(pages);
                setEquipment(equipmentData);
                setError(null);
            } catch (error) {
                if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
                console.error("Error fetching data:", error);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        },
        [
            authToken,
            currentPage,
            equipmentsPerPage,
            debouncedSearch,
            statusFilter,
            categoryFilter, // ✅ NEW dependency
        ]
    );

    // Auto-fetch kapag nag-change ang dependencies
    useEffect(() => {
        const controller = new AbortController();
        fetchEquipmentData(controller.signal);

        return () => controller.abort();
    }, [fetchEquipmentData]);

    // 🔹 Fetch single equipment by ID
    const fetchEquipmentById = async (equipmentID) => {
        if (!authToken || !equipmentID) return null;
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipmentID}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            const data = res?.data?.data || null;
            setEquipmentById(data);
            return { success: true, data };
        } catch (error) {
            console.error("Error fetching equipment by ID:", error);
            setCustomError("Failed to fetch equipment.");
            return { success: false, error: "Failed to fetch equipment." };
        }
    };

    // 🔹 Fetch equipment by CODE
    const fetchEquipmentByCode = async (code) => {
        if (!authToken || !code) return null;
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/code/${code}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (res?.data?.status === "success" && res?.data?.data) {
                setEquipmentByCode(res.data.data);
                return { success: true, data: res.data.data };
            } else {
                setEquipmentByCode(null);
                return {
                    success: false,
                    error: res?.data?.message || "No equipment found.",
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
                setEquipmentByCode(null);
                return { success: false, error: message };
            } else if (error.request) {
                setCustomError("No response from the server.");
                return { success: false, error: "No response from the server." };
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
                return {
                    success: false,
                    error: error.message || "Unexpected error occurred.",
                };
            }
        }
    };

    // ============================================================
    // FETCH MY LABORATORY
    // ============================================================
    const fetchMyLaboratory = async (filters = {}) => {
        if (!authToken) return null;
        setLoading(true);
        try {
            const params = {};

            if (filters.all) {
                params.all = "true";
            } else {
                if (filters.from) params.from = filters.from;
                if (filters.to) params.to = filters.to;
            }

            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/FindByEquipment`,
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
                setPmsRecord(pmsRecords);

                return {
                    success: true,
                    data: labData,
                    pmsRecord: pmsRecords,
                };
            } else {
                setMyLaboratory(null);
                setPmsRecord([]);
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
                setPmsRecord([]);
                return { success: false, error: message };
            } else if (error.request) {
                setCustomError("No response from the server.");
                setMyLaboratory(null);
                setPmsRecord([]);
                return {
                    success: false,
                    error: "No response from the server.",
                };
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
                setMyLaboratory(null);
                setPmsRecord([]);
                return {
                    success: false,
                    error: error.message || "Unexpected error occurred.",
                };
            }
        } finally {
            setLoading(false);
        }
    };

    const sendaddEquipment = async (values) => {
        try {
            const response = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment`,
                {
                    code: values.code,
                    Category: values.Category,
                    Specification: values.Specification,
                    Brand: values.Brand,
                    SerialNumber: values.SerialNumber,
                    remarks: values.remarks,
                    DateAcquired: values.DateAcquired,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchEquipmentData();
                return { success: true, data: response?.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return {
                    success: false,
                    error: "Unexpected response from server.",
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
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
            return { success: false, error: customError };
        }
    };

    const EditEquipmentData = async (equipmentID, values) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipmentID}`,
                {
                    code: values.code,
                    Category: values.Category,
                    Specification: values.Specification,
                    Brand: values.Brand,
                    SerialNumber: values.SerialNumber,
                    remarks: values.remarks,
                    DateAcquired: values.DateAcquired,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            console.log("response", response)

            if (response.data && response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchEquipmentData();
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
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message =
                    typeof errorData === "string"
                        ? errorData
                        : errorData.message ||
                        errorData.error ||
                        "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
            return { success: false, error: customError };
        }
    };

    const DeleteDatas = async (equipmentID) => {
        try {
            const response = await axiosInstance.delete(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/delete/${equipmentID}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            if (response.data && response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchEquipmentData();
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
            setCustomError("Failed to delete equipment.");
            return { success: false, error: "Failed to delete equipment." };
        }
    };

    // 🔹 Helpers
    const resetError = () => setError(null);
    const clearSelection = () => setSelectedEquipment(null);

    // ✅ Reset all filters helper
    const resetFilters = useCallback(() => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("");
        setCategoryFilter("");
        setCurrentPage(1);
    }, []);

    // 🔹 Derived — filtered equipment (client-side fallback filter)
    // NOTE: Since server-side filters are now active, this is mostly for
    // instant UI feedback / belt-and-suspenders. Safe pa rin gamitin.
    const filteredEquipment = useMemo(() => {
        let list = equipment || [];

        if (statusFilter && statusFilter !== "All") {
            list = list.filter((item) => item.status === statusFilter);
        }

        // ✅ Category filter (client-side, matches by Category ObjectId)
        if (categoryFilter && categoryFilter !== "All") {
            if (categoryFilter === "null" || categoryFilter === "unassigned") {
                list = list.filter((item) => !item.Category);
            } else {
                list = list.filter(
                    (item) => String(item.Category) === String(categoryFilter)
                );
            }
        }

        if (searchQuery && searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            list = list.filter((item) => {
                return (
                    item.code?.toLowerCase().includes(q) ||
                    item.Brand?.toLowerCase().includes(q) ||
                    item.Specification?.toLowerCase().includes(q) ||
                    item.SerialNumber?.toLowerCase().includes(q) ||
                    item.CategoryName?.toLowerCase().includes(q)
                );
            });
        }

        return list;
    }, [equipment, statusFilter, categoryFilter, searchQuery]);

    const UpdateStatus = async (equipmentID, status) => {
        if (!authToken || !equipmentID) {
            return { success: false, error: "Missing required parameters." };
        }

        console.log("status", status)

        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/UpdateStatus/${equipmentID}`,
                { status },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response?.data?.status === "success") {
                const updated = response.data.data;

                setEquipment((prev) =>
                    prev.map((eq) =>
                        eq._id === equipmentID ? { ...eq, ...updated } : eq
                    )
                );

                return { success: true, data: updated };
            } else {
                return {
                    success: false,
                    error:
                        response?.data?.message ||
                        "Unexpected response from server.",
                };
            }
        } catch (error) {
            let message = "Failed to update status.";

            if (error.response && error.response.data) {
                const errorData = error.response.data;
                message =
                    typeof errorData === "string"
                        ? errorData
                        : errorData?.message ||
                        errorData.error ||
                        "Failed to update status.";
                setCustomError(message);
            } else if (error.request) {
                message = "No response from the server.";
                setCustomError(message);
            } else {
                message = error.message || "Unexpected error occurred.";
                setCustomError(message);
            }

            return { success: false, error: message };
        }
    };

    return (
        <EquipmentDataContext.Provider
            value={{
                // existing
                DeleteDatas,
                EditEquipmentData,
                setCustomError,
                customError,
                sendaddEquipment,
                equipmentsPerPage,
                setequipmentsPerPage,
                setCurrentPage,
                currentPage,
                totalPages,
                TotalAvailableEquipments,
                totalEquipments,
                equipment,
                setEquipment,
                loading,
                error,
                fetchEquipmentData,

                // bagong dagdag
                selectedEquipment,
                setSelectedEquipment,
                equipmentById,
                fetchEquipmentById,
                equipmentByCode,
                setEquipmentByCode,
                fetchEquipmentByCode,
                searchQuery,
                setSearchQuery,
                debouncedSearch,
                statusFilter,
                setStatusFilter,
                categoryFilter,      // ✅ NEW
                setCategoryFilter,   // ✅ NEW
                filteredEquipment,
                resetError,
                clearSelection,
                resetFilters,        // ✅ NEW helper
                setError,
                setLoading,
                myLaboratory,
                setMyLaboratory,
                fetchMyLaboratory,
                PmsRecord,

                // UpdateStatus
                UpdateStatus,
            }}
        >
            {children}

            <StatusModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </EquipmentDataContext.Provider>
    );
};

export default EquipmentProvider;