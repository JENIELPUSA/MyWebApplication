import React, { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

// ==========================================================
// CREATE CONTEXT
// ==========================================================
export const StatisticsContext = createContext();

// ==========================================================
// PROVIDER COMPONENT
// ==========================================================
export const StatisticsProvider = ({ children }) => {
    // ======================================================
    // STATE MANAGEMENT
    // ======================================================
    const { authToken } = useContext(AuthContext);

    // Loading & Error States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");

    // Statistics Data States
    const [statisticsData, setStatisticsData] = useState(null);
    const [equipmentStats, setEquipmentStats] = useState(null);
    const [maintenanceStats, setMaintenanceStats] = useState(null);
    const [requestStats, setRequestStats] = useState(null);

    // Supply Statistics States
    const [supplyStatistics, setSupplyStatistics] = useState(null);
    const [supplySummary, setSupplySummary] = useState(null);
    const [supplyCards, setSupplyCards] = useState(null);
    const [supplyCharts, setSupplyCharts] = useState(null);
    const [supplyRecentlyAdded, setSupplyRecentlyAdded] = useState(null);

    // Chart Data States
    const [pieChartData, setPieChartData] = useState(null);
    const [lineGraphData, setLineGraphData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);

    // Technician Statistics States
    const [technicianStats, setTechnicianStats] = useState(null);
    const [technicianDashboardCards, setTechnicianDashboardCards] = useState(null);
    const [technicianEquipment, setTechnicianEquipment] = useState(null);
    const [technicianPieCharts, setTechnicianPieCharts] = useState(null);
    const [technicianLineGraphs, setTechnicianLineGraphs] = useState(null);

    // UI States
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [modalMessage, setModalMessage] = useState("");

    // ======================================================
    // REFS FOR PREVENTING MULTIPLE CALLS
    // ======================================================
    const isFetchingRef = useRef(false);
    const fetchTimeoutRef = useRef(null);
    const lastFetchTimeRef = useRef(0);
    const hasInitializedRef = useRef(false);

    // ======================================================
    // HELPER: CHECK IF WE SHOULD FETCH
    // ======================================================
    const shouldFetch = useCallback(() => {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;
        
        if (isFetchingRef.current) {
            console.log("⏳ Fetch already in progress, skipping...");
            return false;
        }

        if (timeSinceLastFetch < 500) {
            console.log("⏳ Too soon since last fetch, skipping...");
            return false;
        }

        return true;
    }, []);

    // ======================================================
    // FETCH STATISTICS DATA (Admin/General)
    // ======================================================
    const fetchStatisticsData = useCallback(async () => {
        if (!shouldFetch()) return;

        if (!authToken) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/statistical`,
                {
                    headers: {
                        withCredentials: true,
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data && response.data.status === "success") {
                const data = response.data.data;

                setStatisticsData(data);
                setEquipmentStats(data.summary);
                setPieChartData(data.pieCharts || null);
                setLineGraphData(data.lineGraphs || null);
                setBarChartData(data.barCharts || null);

                setMaintenanceStats({
                    totalSchedules: data.summary.totalMaintenanceSchedules,
                    totalOverdue: data.summary.totalOverdueSchedules,
                    byType: data.pieCharts?.maintenanceByScheduleType || [],
                    byLaboratory: data.barCharts?.maintenanceByLaboratory || [],
                    byDepartment: data.barCharts?.maintenanceByDepartment || [],
                });

                setRequestStats({
                    totalRequests: data.summary.totalMaintenanceRequests,
                    byStatus: data.pieCharts?.requestsByStatus || [],
                    byLaboratory: data.barCharts?.requestsByLaboratory || [],
                    byDepartment: data.barCharts?.requestsByDepartment || [],
                    byYear: data.lineGraphs?.requestsByYear || [],
                    byMonth: data.lineGraphs?.requestsByMonth || [],
                });

                lastFetchTimeRef.current = Date.now();
                hasInitializedRef.current = true;

                return { success: true, data: data };
            } else {
                throw new Error("Unexpected response from server");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch statistics data";

            setError(errorMessage);
            setCustomError(errorMessage);
            setModalStatus("failed");
            setModalMessage(errorMessage);
            setShowModal(true);

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [authToken, shouldFetch]);

    // ======================================================
    // FETCH SUPPLY STATISTICS (Equipment Statistics)
    // ======================================================
    const fetchSupplyStatistics = useCallback(async () => {
        if (!shouldFetch()) return;

        if (!authToken) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/statistical/supply_statistical`,
                {
                    headers: {
                        withCredentials: true,
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data && response.data.success === true) {
                const data = response.data.data;

                setSupplyStatistics(data);
                setSupplySummary(data.summary);
                setSupplyCards(data.cards);
                setSupplyCharts(data.charts);
                setSupplyRecentlyAdded(data.recentlyAdded);

                lastFetchTimeRef.current = Date.now();

                return { success: true, data: data };
            } else {
                throw new Error(response.data?.message || "Unexpected response from server");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch supply statistics";

            setError(errorMessage);
            setCustomError(errorMessage);
            setModalStatus("failed");
            setModalMessage(errorMessage);
            setShowModal(true);

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [authToken, shouldFetch]);

    // ======================================================
    // FETCH TECHNICIAN STATISTICS
    // ======================================================
    const fetchTechnicianStatistics = useCallback(async () => {
        if (!shouldFetch()) return;

        if (!authToken) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/statistical/technician_statistics`,
                {
                    headers: {
                        withCredentials: true,
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data && response.data.status === "success") {
                const data = response.data.data;

                console.log("data", data);

                setTechnicianStats(data);
                setTechnicianDashboardCards(data.dashboardCards || null);
                setTechnicianEquipment(data.technicianEquipment || null);
                setTechnicianPieCharts(data.pieCharts || null);
                setTechnicianLineGraphs(data.lineGraphs || null);

                lastFetchTimeRef.current = Date.now();

                return { success: true, data: data };
            } else {
                throw new Error("Unexpected response from server");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch technician statistics";

            setError(errorMessage);
            setCustomError(errorMessage);
            setModalStatus("failed");
            setModalMessage(errorMessage);
            setShowModal(true);

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [authToken, shouldFetch]);

    // ======================================================
    // REFRESH DATA
    // ======================================================
    const refreshData = useCallback(async () => {
        lastFetchTimeRef.current = 0;
        await fetchStatisticsData();
    }, [fetchStatisticsData]);

    const refreshSupplyData = useCallback(async () => {
        lastFetchTimeRef.current = 0;
        await fetchSupplyStatistics();
    }, [fetchSupplyStatistics]);

    const refreshTechnicianData = useCallback(async () => {
        lastFetchTimeRef.current = 0;
        await fetchTechnicianStatistics();
    }, [fetchTechnicianStatistics]);

    // ======================================================
    // CLEAR ERROR
    // ======================================================
    const clearError = useCallback(() => {
        setError(null);
        setCustomError("");
    }, []);

    // ======================================================
    // AUTO-DISMISS ERROR
    // ======================================================
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError("");
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    // ======================================================
    // CONTEXT VALUE - MEMOIZED - TINANGGAL ANG DEBOUNCE
    // ======================================================
    const contextValue = useMemo(() => ({
        // State - General Statistics
        loading,
        error,
        customError,
        statisticsData,
        equipmentStats,
        maintenanceStats,
        requestStats,
        pieChartData,
        lineGraphData,
        barChartData,

        // State - Supply Statistics (Equipment)
        supplyStatistics,
        supplySummary,
        supplyCards,
        supplyCharts,
        supplyRecentlyAdded,

        // State - Technician Statistics
        technicianStats,
        technicianDashboardCards,
        technicianEquipment,
        technicianPieCharts,
        technicianLineGraphs,

        // UI States
        showModal,
        modalStatus,
        modalMessage,

        // Functions - Direct, walang debounce para iwas loop
        fetchStatisticsData,
        refreshData,
        clearError,

        // Functions - Supply
        fetchSupplyStatistics,
        refreshSupplyData,

        // Functions - Technician
        fetchTechnicianStatistics,
        refreshTechnicianData,

        // Modal Controls
        setShowModal,
        setModalStatus,
        setModalMessage,
    }), [
        loading,
        error,
        customError,
        statisticsData,
        equipmentStats,
        maintenanceStats,
        requestStats,
        pieChartData,
        lineGraphData,
        barChartData,
        supplyStatistics,
        supplySummary,
        supplyCards,
        supplyCharts,
        supplyRecentlyAdded,
        technicianStats,
        technicianDashboardCards,
        technicianEquipment,
        technicianPieCharts,
        technicianLineGraphs,
        showModal,
        modalStatus,
        modalMessage,
        fetchStatisticsData,
        refreshData,
        clearError,
        fetchSupplyStatistics,
        refreshSupplyData,
        fetchTechnicianStatistics,
        refreshTechnicianData,
    ]);

    // ======================================================
    // RENDER
    // ======================================================
    return (
        <StatisticsContext.Provider value={contextValue}>
            {children}

            {/* Status Modal */}
            <StatusModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                message={modalMessage}
            />
        </StatisticsContext.Provider>
    );
};