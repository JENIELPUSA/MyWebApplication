import React, { createContext, useState, useEffect, useContext } from "react";
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
    // FETCH STATISTICS DATA (Admin/General)
    // ======================================================
    const fetchStatisticsData = async () => {
        if (!authToken) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

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

                // Store full data
                setStatisticsData(data);

                // Store summary
                setEquipmentStats(data.summary);

                // Store chart data
                setPieChartData(data.pieCharts || null);
                setLineGraphData(data.lineGraphs || null);
                setBarChartData(data.barCharts || null);

                // Store individual stats for easy access
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
        }
    };

    // ======================================================
    // FETCH TECHNICIAN STATISTICS
    // ======================================================
    const fetchTechnicianStatistics = async () => {
        if (!authToken) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

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

                // Store full technician data
                setTechnicianStats(data);

                // Store dashboard cards
                setTechnicianDashboardCards(data.dashboardCards || null);

                // Store technician equipment list
                setTechnicianEquipment(data.technicianEquipment || null);

                // Store chart data
                setTechnicianPieCharts(data.pieCharts || null);
                setTechnicianLineGraphs(data.lineGraphs || null);

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
        }
    };

    // ======================================================
    // REFRESH DATA
    // ======================================================
    const refreshData = async () => {
        setLoading(true);
        await fetchStatisticsData();
        setLoading(false);
    };

    // ======================================================
    // REFRESH TECHNICIAN DATA
    // ======================================================
    const refreshTechnicianData = async () => {
        setLoading(true);
        await fetchTechnicianStatistics();
        setLoading(false);
    };

    // ======================================================
    // CLEAR ERROR
    // ======================================================
    const clearError = () => {
        setError(null);
        setCustomError("");
    };

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
    // INITIAL FETCH
    // ======================================================
    useEffect(() => {
        if (authToken) {
            fetchStatisticsData();
            fetchTechnicianStatistics();
        }
    }, [authToken]);

    // ======================================================
    // CONTEXT VALUE
    // ======================================================
    const contextValue = {
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

        // Functions - General
        fetchStatisticsData,
        refreshData,
        clearError,

        // Functions - Technician
        fetchTechnicianStatistics,
        refreshTechnicianData,

        // Modal Controls
        setShowModal,
        setModalStatus,
        setModalMessage,
    };

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