import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
} from "react";

import axios from "axios";
import { AuthContext } from "../AuthContext";

export const MaintenanceRecordContext = createContext();

export const MaintenanceRecordProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState(null);

    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    // Optional filters
    const [filterEquipmentId, setFilterEquipmentId] = useState("");
    const [filterPerformedBy, setFilterPerformedBy] = useState("");

    // ===========================
    // FETCH ALL MAINTENANCE RECORDS
    // ===========================
    const FetchMaintenanceRecords = useCallback(async () => {
        if (!authToken) return;

        try {
            setLoading(true);

            const params = {
                page: currentPage,
                limit: rowsPerPage,
            };

            if (filterEquipmentId) params.equipmentId = filterEquipmentId;
            if (filterPerformedBy) params.performedBy = filterPerformedBy;

            const response = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/maintenance`,
                {
                    params,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            setMaintenanceRecords(response.data.data || []);
            setTotalRecords(response.data.totalRecords || 0);
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            console.error("FetchMaintenanceRecords Error:", error);
            setCustomError(
                error.response?.data?.message ||
                "Failed to fetch maintenance records."
            );
        } finally {
            setLoading(false);
        }
    }, [
        authToken,
        currentPage,
        rowsPerPage,
        filterEquipmentId,
        filterPerformedBy,
    ]);

    // Auto-fetch kapag nagbago ang dependencies
    useEffect(() => {
        FetchMaintenanceRecords();
    }, [FetchMaintenanceRecords]);


    const FetchSingleMaintenanceRecord = useCallback(
        async (id) => {
            if (!authToken) return null;

            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/maintenance/DisplayEquipmentMaintenance/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.data.status === "success") {
                    setSelectedMaintenanceRecord(response.data.data);
                    return response.data.data;
                }
                return null;
            } catch (error) {
                console.error("FetchSingleMaintenanceRecord Error:", error);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [authToken]
    );

    // ===========================
    // ADD MAINTENANCE RECORD
    // ===========================
    const AddMaintenanceRecord = useCallback(
        async (values) => {
            if (!authToken) {
                return { success: false, error: "Not authenticated." };
            }

            const payload = {
                code: values.code || "",
                EquipmentId: values.EquipmentId,
                Lubrication: values.Lubrication || false,
                Overhauling: values.Overhauling || false,
                Replace_worn_out_parts: values.Replace_worn_out_parts || false,
                General_Recondition: values.General_Recondition || false,
                RepairParts: values.RepairParts || false,
                MinorAdjustment: values.MinorAdjustment || false,
                Repair: values.Repair || false,
                RoutineInspectionCleaning:
                    values.RoutineInspectionCleaning || false,
                remarks: values.remarks || "",
            };

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/maintenance`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.data.status === "success") {
                    // ✅ Auto-refresh listahan
                    await FetchMaintenanceRecords();

                    return {
                        success: true,
                        data: response.data.data,
                    };
                }

                return { success: false };
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    "Failed to add Maintenance Record.";

                setCustomError(message);

                return {
                    success: false,
                    error: message,
                };
            }
        },
        [authToken, FetchMaintenanceRecords]
    );

    // ===========================
    // UPDATE MAINTENANCE RECORD
    // ===========================
    const UpdateMaintenanceRecord = useCallback(
        async (id, values) => {
            if (!authToken) {
                return { success: false, error: "Not authenticated." };
            }

            try {
                const response = await axios.patch(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/maintenance/${id}`,
                    {
                        code: values.code,
                        EquipmentId: values.EquipmentId,
                        Lubrication: values.Lubrication,
                        Overhauling: values.Overhauling,
                        Replace_worn_out_parts: values.Replace_worn_out_parts,
                        General_Recondition: values.General_Recondition,
                        RepairParts: values.RepairParts,
                        MinorAdjustment: values.MinorAdjustment,
                        Repair: values.Repair,
                        RoutineInspectionCleaning:
                            values.RoutineInspectionCleaning,
                        remarks: values.remarks,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.data.status === "success") {
                    // ✅ Auto-refresh listahan
                    await FetchMaintenanceRecords();

                    return {
                        success: true,
                        data: response.data.data,
                    };
                }

                return { success: false };
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    "Failed to update Maintenance Record.";

                setCustomError(message);

                return {
                    success: false,
                    error: message,
                };
            }
        },
        [authToken, FetchMaintenanceRecords]
    );

    // ===========================
    // DELETE MAINTENANCE RECORD
    // ===========================
    const DeleteMaintenanceRecord = useCallback(
        async (id) => {
            if (!authToken) {
                return { success: false, error: "Not authenticated." };
            }

            try {
                const response = await axios.delete(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/maintenance/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.data.status === "success") {
                    // Optimistic update
                    setMaintenanceRecords((prev) =>
                        prev.filter((item) => item._id !== id)
                    );

                    // ✅ Sync sa server
                    await FetchMaintenanceRecords();

                    return { success: true };
                }

                return { success: false };
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    "Failed to delete Maintenance Record.";

                setCustomError(message);

                return {
                    success: false,
                    error: message,
                };
            }
        },
        [authToken, FetchMaintenanceRecords]
    );

    // ===========================
    // SEARCH / FILTERS
    // ===========================
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleRowsPerPageChange = useCallback((rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1);
    }, []);

    return (
        <MaintenanceRecordContext.Provider
            value={{
                loading,
                maintenanceRecords,
                selectedMaintenanceRecord,
                totalRecords,
                totalPages,
                currentPage,
                rowsPerPage,
                searchQuery,

                filterEquipmentId,
                filterPerformedBy,
                setFilterEquipmentId,
                setFilterPerformedBy,

                FetchMaintenanceRecords,
                FetchSingleMaintenanceRecord,

                AddMaintenanceRecord,
                UpdateMaintenanceRecord,
                DeleteMaintenanceRecord,

                setRowsPerPage: handleRowsPerPageChange,
                setCurrentPage: handlePageChange,
                setSearchQuery: handleSearch,
                handleSearch,
                handlePageChange,
                handleRowsPerPageChange,
                setMaintenanceRecords,

                customError,
                setCustomError,
                showModal,
                setShowModal,
                modalStatus,
                setModalStatus,
            }}
        >
            {children}
        </MaintenanceRecordContext.Provider>
    );
};