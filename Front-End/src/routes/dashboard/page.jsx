import React, { useRef, useEffect, useContext, useState, useCallback, useMemo } from "react";
import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Line, LineChart, ComposedChart, Bar, BarChart, Cell, PieChart, Pie } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "../../layouts/footer";
import { FaChartLine, FaChartBar, FaStar } from "react-icons/fa";
import DashboardCard from "../../components/Card/DashboardCard";
import TechnicianTable from "../../components/Technician/TechnicianTable";
import Laboratory from "../../components/Assign/Laboratory";

// Contexts
import { AuthContext } from "../../contexts/AuthContext";
import { FilterSpecificAssignContext } from "../../contexts/FilterSpecificAssignContext/FilterSpecificAssignContext";
import { IncomingDisplayContext } from "../../contexts/ProcessIncomingRequest/IncomingRequestContext";

// React Hooks
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { StatisticsContext } from "../../contexts/StatisticContext/statisticalContext";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";
import { UserDataContext } from "../../contexts/UserContext/UserContext";

// Icons
import { FaFlask, FaTerminal, FaUserEdit, FaChevronRight, FaTools, FaDownload, FaPrint, FaClipboardList, FaWrench, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";

// Separated Components
import DashboardBanner from "../../routes/dashboard/dashboardRole/DashboardBanner";
import ProfessionalLineGraph from "../../routes/dashboard/dashboardRole/ProfessionalLineGraph";
import ProfessionalBarChart from "../../routes/dashboard/dashboardRole/ProfessionalBarChart";
import DashboardPieCharts from "../../routes/dashboard/dashboardRole/DashboardPieCharts";
import UserDashboard from "../../routes/dashboard/dashboardRole/UserDashboard";
import TechnicianDashboard from "../../routes/dashboard/dashboardRole/TechnicianDashboard";
import SupplyDashboard from "./dashboardRole/SupplyDashboard";

import ReassignModal from './dashboardRole/ReassignModal';

function Dashboard() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const { laboratoryData } = useContext(FilterSpecificAssignContext);
    const { role } = useContext(AuthContext);
    const { fetchIncomingData } = useContext(IncomingDisplayContext);
    const location = useLocation();
    const navigate = useNavigate();
    const {
        technicianStats,
        statisticsData,
        supplyStatistics,
        fetchStatisticsData,
        fetchSupplyStatistics,
        fetchTechnicianStatistics
    } = useContext(StatisticsContext);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // ==========================================
    // USE REFS PARA I-STABILIZE ANG FUNCTIONS
    // ==========================================
    const fetchStatisticsDataRef = useRef(fetchStatisticsData);
    const fetchTechnicianStatisticsRef = useRef(fetchTechnicianStatistics);
    const fetchSupplyStatisticsRef = useRef(fetchSupplyStatistics);
    const fetchIncomingDataRef = useRef(fetchIncomingData);
    const hasFetchedRef = useRef(false);

    // Update refs when functions change
    useEffect(() => {
        fetchStatisticsDataRef.current = fetchStatisticsData;
        fetchTechnicianStatisticsRef.current = fetchTechnicianStatistics;
        fetchSupplyStatisticsRef.current = fetchSupplyStatistics;
        fetchIncomingDataRef.current = fetchIncomingData;
    }, [fetchStatisticsData, fetchTechnicianStatistics, fetchSupplyStatistics, fetchIncomingData]);

    console.log("statisticsData", statisticsData);

    const laboratory = location.state?.laboratory;

    const handleSelectDisplay = useCallback((selectedAssignEquipment) => {
        navigate("/dashboard/RequestMaintenances", { state: { selectedAssignEquipment } });
    }, [navigate]);

    // ==========================================
    // ROLE-BASED STATISTICS FETCHING - FIXED
    // ==========================================
    useEffect(() => {
        let isMounted = true;
        let timeoutId = null;

        console.log("🔄 Role:", role);

        const fetchStatistics = async () => {
            try {
                if (role === "Admin") {
                    console.log("📊 Fetching Admin Statistics...");
                    await Promise.all([
                        fetchStatisticsDataRef.current(),
                        fetchTechnicianStatisticsRef.current(),
                        fetchSupplyStatisticsRef.current()
                    ]);
                } else if (role === "Technician") {
                    console.log("🔧 Fetching Technician Statistics...");
                    await fetchTechnicianStatisticsRef.current();
                } else if (role === "Supply") {
                    console.log("📦 Fetching Supply Statistics...");
                    await fetchSupplyStatisticsRef.current();
                } else if (role === "User") {
                    console.log("👤 Fetching User Statistics...");
                }
                hasFetchedRef.current = true;
            } catch (error) {
                console.error(`❌ Error fetching ${role} statistics:`, error);
            }
        };

        // Reset fetch flag kapag nagbago ang role
        if (role) {
            hasFetchedRef.current = false;
        }

        timeoutId = setTimeout(() => {
            if (isMounted && !hasFetchedRef.current) {
                fetchStatistics();
            }
        }, 100);

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [role]); // ✅ role LANG ang dependency

    // ==========================================
    // ADMIN - Fetch Incoming Data - FIXED
    // ==========================================
    useEffect(() => {
        let isMounted = true;
        let timeoutId = null;

        if (role === "Admin") {
            console.log("📥 Fetching Admin Incoming Data...");
            timeoutId = setTimeout(() => {
                if (isMounted) {
                    fetchIncomingDataRef.current();
                }
            }, 200);
        }

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [role]); // ✅ role LANG ang dependency

    return (
        <div className="flex h-screen w-full bg-white dark:bg-slate-900 overflow-hidden font-poppins">
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-slate-800">
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="p-4 sm:p-6 lg:p-8"
                    >
                        <DashboardBanner role={role} laboratory={laboratory} />

                        <div className="mt-2">
                            <AnimatePresence mode="wait">
                                {laboratory ? (
                                    <motion.div
                                        key="lab-view"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <LaboratoryView laboratory={laboratory} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="dash-view"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-1"
                                    >
                                        <div className="grid grid-cols-1">
                                            <DashboardCard
                                                Laboratory={laboratoryData}
                                                statisticsData={statisticsData}
                                                technicianStats={technicianStats}
                                                supplyStatistics={supplyStatistics}
                                            />
                                        </div>

                                        {role === "Admin" && (
                                            <AdminDashboard statisticsData={statisticsData} />
                                        )}

                                        {role === "User" && (
                                            <UserDashboard onSelect={handleSelectDisplay} laboratoryData={laboratoryData} />
                                        )}

                                        {role === "Technician" && <TechnicianDashboard technicianStats={technicianStats} />}

                                        {role === "Supply" && <SupplyDashboard supplyStatistics={supplyStatistics} />}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <footer className="mt-4">
                        <Footer />
                    </footer>
                </main>
            </div>
        </div>
    );
}

// ============================================================
// ADMIN DASHBOARD - MEMOIZED
// ============================================================
const AdminDashboard = React.memo(({ statisticsData }) => {
    const { technicians, techniciansLoading } = useContext(UserDataContext);
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [timeRange, setTimeRange] = useState("yearly");
    const [activeChart, setActiveChart] = useState("line");
    const [barChartType, setBarChartType] = useState("equipment");
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { technicianTasks } = useContext(MaintenanceRequestContext);

    // Reassign Modal State
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedTaskTechnician, setSelectedTaskTechnician] = useState('');
    const [isReassigning, setIsReassigning] = useState(false);
    const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);

    const { pieCharts, lineGraphs, barCharts } = statisticsData || {};

    // Process technicianTasks data - MEMOIZED
    const taskStats = useMemo(() => {
        if (!technicianTasks || technicianTasks.length === 0) {
            return {
                totalTasks: 0,
                completedTasks: 0,
                assignedTasks: 0,
                inProgressTasks: 0,
                pendingTasks: 0,
                tasks: [],
                technicians: []
            };
        }

        const technicians = technicianTasks.map(taskData => {
            const tasks = taskData?.tasks || [];

            const completed = tasks.filter(t => t.Status === "Completed").length;
            const assigned = tasks.filter(t => t.Status === "Assigned").length;
            const inProgress = tasks.filter(t => t.Status === "In Progress").length;
            const pending = tasks.filter(t => t.Status === "Pending").length;

            return {
                technicianName: taskData?.technicianName || 'Unknown Technician',
                technicianId: taskData?.technicianId?.[0] || taskData?.technicianId || '',
                totalTasks: taskData?.totalTasks || tasks.length,
                completedTasks: completed,
                assignedTasks: assigned,
                inProgressTasks: inProgress,
                pendingTasks: pending,
                tasks: tasks,
                hasAssignedTasks: assigned > 0
            };
        });

        technicians.sort((a, b) => {
            if (a.hasAssignedTasks && !b.hasAssignedTasks) return -1;
            if (!a.hasAssignedTasks && b.hasAssignedTasks) return 1;
            return b.assignedTasks - a.assignedTasks;
        });

        const totalTechs = technicians.length;
        const techniciansWithTasks = technicians.filter(t => t.hasAssignedTasks).length;
        const totalAllTasks = technicians.reduce((sum, t) => sum + t.totalTasks, 0);
        const totalCompleted = technicians.reduce((sum, t) => sum + t.completedTasks, 0);
        const totalAssigned = technicians.reduce((sum, t) => sum + t.assignedTasks, 0);
        const totalInProgress = technicians.reduce((sum, t) => sum + t.inProgressTasks, 0);
        const totalPending = technicians.reduce((sum, t) => sum + t.pendingTasks, 0);

        return {
            totalTasks: totalAllTasks,
            completedTasks: totalCompleted,
            assignedTasks: totalAssigned,
            inProgressTasks: totalInProgress,
            pendingTasks: totalPending,
            technicians: technicians,
            totalTechnicians: totalTechs,
            techniciansWithTasks: techniciansWithTasks,
            tasks: technicians.flatMap(t => t.tasks)
        };
    }, [technicianTasks]);

    // Carousel settings
    const itemsPerPage = 6;
    const totalPages = Math.ceil(taskStats.technicians.length / itemsPerPage);
    const maxIndex = totalPages - 1;

    const getInitials = useCallback((name) => {
        if (!name || name === 'N/A') return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }, []);

    const getAvatarColor = useCallback((name) => {
        const colors = [
            'from-blue-600 to-blue-700',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600',
            'from-teal-500 to-teal-600',
            'from-orange-500 to-orange-600',
            'from-cyan-500 to-cyan-600',
            'from-rose-500 to-rose-600'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }, []);

    const handleAvatarClick = useCallback((technician) => {
        if (!technician.hasAssignedTasks) {
            return;
        }
        setSelectedTechnician(technician);
        setShowTaskModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowTaskModal(false);
        setSelectedTechnician(null);
    }, []);

    // Reassign functions - MEMOIZED
    const handleOpenReassignModal = useCallback((task) => {
        setSelectedTask(task);
        const tech = taskStats.technicians.find(t =>
            t.tasks.some(tk => tk._id === task._id)
        );
        setSelectedTaskTechnician(tech?.technicianName || 'Unknown');
        setShowReassignModal(true);
        setIsLoadingTechnicians(false);
    }, [taskStats.technicians]);

    const handleCloseReassignModal = useCallback(() => {
        setShowReassignModal(false);
        setSelectedTask(null);
        setSelectedTaskTechnician('');
        setIsReassigning(false);
    }, []);

    const handleReassignSubmit = useCallback((data) => {
        setIsReassigning(true);
        console.log('Reassign data:', data);
        setTimeout(() => {
            alert(`Task ${data.taskRef || data.taskId} reassigned to ${data.newTechnicianName}`);
            setIsReassigning(false);
            handleCloseReassignModal();
        }, 1500);
    }, [handleCloseReassignModal]);

    // Pagination handlers - MEMOIZED
    const handlePrevPage = useCallback(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }, [maxIndex]);

    const handlePageClick = useCallback((idx) => {
        setCurrentIndex(idx);
    }, []);

    // Chart toggle handlers - MEMOIZED
    const handleSetActiveChart = useCallback((chart) => {
        setActiveChart(chart);
    }, []);

    const handleSetBarChartType = useCallback((type) => {
        setBarChartType(type);
    }, []);

    const handleSetTimeRange = useCallback((range) => {
        setTimeRange(range);
    }, []);

    return (
        <div className="space-y-8">
            {/* Technicians Avatar Section */}
            {taskStats.technicians.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-700 rounded-xl shadow-lg">
                            <FaWrench className="text-yellow-400 text-xl" />
                        </div>
                        <div>
                            <h3 className="font-black text-blue-700 dark:text-yellow-400 uppercase text-sm tracking-widest">
                                Technicians & Assigned Tasks
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                {taskStats.techniciansWithTasks} technicians have assigned tasks • {taskStats.assignedTasks} total assigned tasks
                            </p>
                        </div>
                        <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-blue-700 dark:text-yellow-400 px-3 py-1 rounded-full bg-blue-100 dark:bg-yellow-900/30">
                            {taskStats.totalTechnicians} Total Technicians
                        </span>
                    </div>

                    {/* Avatar Grid - Carousel */}
                    <div className="relative overflow-hidden">
                        <div
                            className="flex gap-6 transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                            }}
                        >
                            {taskStats.technicians.map((tech, index) => {
                                const hasTasks = tech.hasAssignedTasks;

                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={hasTasks ? { y: -4, scale: 1.05 } : {}}
                                        whileTap={hasTasks ? { scale: 0.95 } : {}}
                                        onClick={() => handleAvatarClick(tech)}
                                        className={`flex flex-col items-center flex-shrink-0 ${hasTasks ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                                        style={{ width: `${100 / itemsPerPage}%` }}
                                    >
                                        <div className="relative">
                                            <div className={`w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg ${hasTasks ? 'group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-yellow-400' : ''} transition-all duration-300 ring-4 ring-transparent`}>
                                                {getInitials(tech.technicianName)}
                                            </div>
                                            {hasTasks ? (
                                                <div className="absolute -top-1 -right-1 bg-yellow-400 text-blue-700 text-[11px] font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 animate-pulse">
                                                    {tech.assignedTasks}
                                                </div>
                                            ) : (
                                                <div className="absolute -top-1 -right-1 bg-gray-400 text-white text-[8px] font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <p className={`text-xs font-bold mt-3 text-center ${hasTasks ? 'text-blue-700 dark:text-yellow-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {tech.technicianName}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            {tech.completedTasks > 0 && (
                                                <span className="text-[10px] font-medium text-green-500 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    {tech.completedTasks}
                                                </span>
                                            )}
                                            {tech.inProgressTasks > 0 && (
                                                <span className="text-[10px] font-medium text-yellow-500 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                                    {tech.inProgressTasks}
                                                </span>
                                            )}
                                            {tech.pendingTasks > 0 && (
                                                <span className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    {tech.pendingTasks}
                                                </span>
                                            )}
                                            {!hasTasks && (
                                                <span className="text-[10px] font-medium text-gray-400">No assigned tasks</span>
                                            )}
                                        </div>

                                        {hasTasks && (
                                            <span className="text-[8px] text-blue-700 dark:text-yellow-400 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to view tasks
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {taskStats.technicians.length > itemsPerPage && (
                            <>
                                <button
                                    onClick={handlePrevPage}
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-700 text-yellow-400 shadow-lg hover:bg-blue-800 transition-all duration-300 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                    disabled={currentIndex === 0}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-700 text-yellow-400 shadow-lg hover:bg-blue-800 transition-all duration-300 ${currentIndex === maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                    disabled={currentIndex === maxIndex}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {taskStats.technicians.length > itemsPerPage && (
                            <div className="flex justify-center gap-2 mt-4">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageClick(idx)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-blue-700 dark:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                    <FaWrench className="text-6xl text-blue-700/30 dark:text-yellow-400/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-blue-700 dark:text-yellow-400">No Technicians Available</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No technician tasks have been assigned yet.</p>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && selectedTechnician && selectedTechnician.hasAssignedTasks && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gray-300 dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(selectedTechnician.technicianName)} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                                    {getInitials(selectedTechnician.technicianName)}
                                </div>
                                <div>
                                    <h3 className="font-black text-blue-700 dark:text-yellow-400 uppercase text-base tracking-widest">
                                        {selectedTechnician.technicianName}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                        {selectedTechnician.assignedTasks} Assigned • {selectedTechnician.completedTasks} Completed • {selectedTechnician.totalTasks} Total
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {selectedTechnician.tasks.length > 0 ? (
                                <div className="space-y-6">
                                    {selectedTechnician.tasks.filter(task => task.Status !== 'Completed').length > 0 && (
                                        <div>
                                            <div className="mb-3 text-xs font-bold text-blue-700 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1 h-4 bg-blue-700 dark:bg-yellow-400 rounded-full"></span>
                                                Active Tasks ({selectedTechnician.assignedTasks + selectedTechnician.inProgressTasks + selectedTechnician.pendingTasks})
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-700 dark:text-yellow-400">Ref</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-700 dark:text-yellow-400">Description</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-700 dark:text-yellow-400">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-700 dark:text-yellow-400">Date</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase text-blue-700 dark:text-yellow-400">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedTechnician.tasks
                                                            .filter(task => task.Status !== 'Completed')
                                                            .map((task) => (
                                                                <tr key={task._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{task.Ref}</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{task.Description}</td>
                                                                    <td className="px-4 py-3">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${task.Status === 'Assigned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                            task.Status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                            }`}>
                                                                            {task.Status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                                        {new Date(task.DateTime).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <button
                                                                            onClick={() => handleOpenReassignModal(task)}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 border-orange-600 transition-all shadow-sm hover:shadow-md"
                                                                            title="Reassign this task to another technician"
                                                                        >
                                                                            <FaUserEdit size={12} />
                                                                            ReAssign
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTechnician.completedTasks > 0 && (
                                        <div>
                                            <div className="mb-3 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                                Completed Tasks ({selectedTechnician.completedTasks})
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-green-600 dark:text-green-400">Ref</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-green-600 dark:text-green-400">Description</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-green-600 dark:text-green-400">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-green-600 dark:text-green-400">Date</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase text-green-600 dark:text-green-400">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedTechnician.tasks
                                                            .filter(task => task.Status === 'Completed')
                                                            .map((task) => (
                                                                <tr key={task._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{task.Ref}</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{task.Description}</td>
                                                                    <td className="px-4 py-3">
                                                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                            {task.Status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                                        {new Date(task.DateTime).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <button
                                                                            disabled
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 border-gray-400 cursor-not-allowed transition-all"
                                                                            title="Cannot reassign completed tasks"
                                                                        >
                                                                            <FaUserEdit size={12} />
                                                                            ReAssign
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaWrench className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No tasks assigned to this technician</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                Total Tasks: <span className="font-bold text-blue-700 dark:text-yellow-400">{selectedTechnician.totalTasks}</span>
                            </p>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Reassign Modal */}
            <ReassignModal
                isOpen={showReassignModal}
                onClose={handleCloseReassignModal}
                task={selectedTask}
                currentTechnician={selectedTaskTechnician}
                technicians={technicians}
                onReassign={handleReassignSubmit}
                isReassigning={isReassigning}
                isLoadingTechnicians={techniciansLoading}
            />

            {/* Chart Toggle */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => handleSetActiveChart("line")}
                        className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center gap-2.5 ${activeChart === "line"
                            ? "bg-blue-700 text-yellow-400 shadow-lg shadow-blue-700/30 scale-105"
                            : "bg-transparent text-blue-700/60 dark:text-yellow-400/60 hover:text-blue-700 dark:hover:text-yellow-400 hover:bg-blue-50 dark:hover:bg-yellow-900/10"
                            }`}
                    >
                        <FaChartLine size={16} className={activeChart === "line" ? "text-yellow-400" : "text-current"} />
                        Line Chart
                        {activeChart === "line" && (
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        )}
                    </button>
                    <button
                        onClick={() => handleSetActiveChart("bar")}
                        className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center gap-2.5 ${activeChart === "bar"
                            ? "bg-blue-700 text-yellow-400 shadow-lg shadow-blue-700/30 scale-105"
                            : "bg-transparent text-blue-700/60 dark:text-yellow-400/60 hover:text-blue-700 dark:hover:text-yellow-400 hover:bg-blue-50 dark:hover:bg-yellow-900/10"
                            }`}
                    >
                        <FaChartBar size={16} className={activeChart === "bar" ? "text-yellow-400" : "text-current"} />
                        Bar Chart
                        {activeChart === "bar" && (
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        )}
                    </button>
                </div>

                {activeChart === "bar" && (
                    <div className="flex gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        {[
                            { value: "equipment", label: "Equipment", icon: <FaFlask size={12} /> },
                            { value: "maintenance", label: "Maintenance", icon: <FaTools size={12} /> },
                            { value: "requests", label: "Requests", icon: <FaChartLine size={12} /> },
                            { value: "feedback", label: "Feedback", icon: <FaStar size={12} /> }
                        ].map((type) => (
                            <button
                                key={type.value}
                                onClick={() => handleSetBarChartType(type.value)}
                                className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center gap-2 ${barChartType === type.value
                                    ? "bg-yellow-400 text-blue-700 shadow-lg shadow-yellow-400/30"
                                    : "bg-transparent text-blue-700/50 dark:text-yellow-400/50 hover:text-blue-700 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-blue-900/10"
                                    }`}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeChart === "line" && (
                    <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-700 rounded-xl shadow-lg shadow-blue-700/20">
                                    <FaChartLine className="text-yellow-400 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-black text-blue-700 dark:text-yellow-400 uppercase text-sm tracking-widest">
                                        Performance Analytics
                                    </h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                        Equipment vs Maintenance Requests Overview
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                                {["yearly", "monthly"].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => handleSetTimeRange(range)}
                                        className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${timeRange === range
                                            ? "bg-blue-700 text-yellow-400 shadow-md"
                                            : "text-blue-700/50 dark:text-yellow-400/50 hover:text-blue-700 dark:hover:text-yellow-400 hover:bg-blue-50 dark:hover:bg-yellow-900/10"
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ProfessionalLineGraph lineGraphData={lineGraphs} isDark={isDark} />
                    </div>
                )}

                {activeChart === "bar" && (
                    <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-700 rounded-xl shadow-lg shadow-blue-700/20">
                                    <FaChartBar className="text-yellow-400 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-black text-blue-700 dark:text-yellow-400 uppercase text-sm tracking-widest">
                                        {barChartType === "equipment" ? "Equipment Distribution" :
                                            barChartType === "maintenance" ? "Maintenance Distribution" :
                                                barChartType === "requests" ? "Requests Distribution" :
                                                    "Feedback Distribution"}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                        {barChartType === "equipment" ? "Equipment by Laboratory" :
                                            barChartType === "maintenance" ? "Maintenance Requests by Laboratory" :
                                                barChartType === "requests" ? "Service Requests by Laboratory" :
                                                    "Feedback by Type"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-700/40 dark:text-yellow-400/40">
                                    Active View
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-[8px] font-black text-blue-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                    BAR CHART
                                </span>
                            </div>
                        </div>
                        <ProfessionalBarChart
                            barChartData={barCharts}
                            isDark={isDark}
                            chartType={barChartType}
                        />
                    </div>
                )}
            </div>

            {/* PIE CHARTS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2.5 bg-blue-700 rounded-xl shadow-lg shadow-blue-700/20">
                        <FaChartLine className="text-yellow-400 text-xl" />
                    </div>
                    <h3 className="font-black text-blue-700 dark:text-yellow-400 uppercase text-sm tracking-widest">
                        Distribution Analytics
                    </h3>
                    <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-blue-700/30 dark:text-yellow-400/30 px-3 py-1 rounded-full bg-blue-50 dark:bg-yellow-900/10 border border-blue-100 dark:border-yellow-800/30">
                        {Object.keys(pieCharts || {}).filter(key => (pieCharts?.[key] || []).length > 0).length} Active
                    </span>
                </div>
                <DashboardPieCharts pieChartData={pieCharts} isDark={isDark} />
            </div>
        </div>
    );
});

// ============================================================
// LABORATORY VIEW - MEMOIZED
// ============================================================
const LaboratoryView = React.memo(({ laboratory }) => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-blue-700/20 dark:border-yellow-400/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
            <Laboratory laboratoryId={laboratory._id} />
        </div>
    </div>
));

export default Dashboard;