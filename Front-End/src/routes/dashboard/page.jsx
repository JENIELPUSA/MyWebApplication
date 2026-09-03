import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Line, LineChart, ComposedChart, Bar, BarChart, Cell, PieChart, Pie } from "recharts";
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
import { useRef, useEffect, useContext, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { StatisticsContext } from "../../contexts/StatisticContext/statisticalContext";
import logobanner from "../../assets/bannerbipsu.jpg"
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";

// Icons
import { FaFlask, FaTerminal, FaHome, FaChevronRight, FaTools, FaDownload, FaPrint, FaClipboardList, FaWrench, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function Dashboard() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const { laboratoryData } = useContext(FilterSpecificAssignContext);
    const { role } = useContext(AuthContext);
    const { fetchIncomingData } = useContext(IncomingDisplayContext);
    const location = useLocation();
    const navigate = useNavigate();
    const { technicianStats, statisticsData } = useContext(StatisticsContext);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    console.log("statisticsData", statisticsData);

    const laboratory = location.state?.laboratory;

    const handleSelectDisplay = (selectedAssignEquipment) => {
        navigate("/dashboard/RequestMaintenances", { state: { selectedAssignEquipment } });
    };

    useEffect(() => {
        if (role === "Admin") {
            fetchIncomingData();
        }
    }, [role, fetchIncomingData]);

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
                                            <DashboardCard Laboratory={laboratoryData} statisticsData={statisticsData} technicianStats={technicianStats} />
                                        </div>

                                        {role === "Admin" && (
                                            <AdminDashboard statisticsData={statisticsData} />
                                        )}

                                        {role === "User" && (
                                            <UserDashboard onSelect={handleSelectDisplay} laboratoryData={laboratoryData} />
                                        )}

                                        {role === "Technician" && <TechnicianDashboard technicianStats={technicianStats} />}
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
// DASHBOARD BANNER - BIPSU BLUE & YELLOW THEME with Full Logo Background
// ============================================================
const DashboardBanner = ({ role, laboratory }) => {
    const getTitle = () => {
        if (laboratory) return "Laboratory Focus";
        return getDashboardTitle(role);
    };

    const getSubtitle = () => {
        if (laboratory) return "Detailed Laboratory View";
        switch (role) {
            case "Admin": return "System Administration & Analytics";
            case "User": return "Department Equipment Management";
            case "Technician": return "Maintenance & Service Console";
            default: return "Industrial Asset Management System";
        }
    };

    const getIcon = () => {
        if (laboratory) return <FaFlask />;
        switch (role) {
            case "Admin": return <FaChartLine />;
            case "User": return <FaTools />;
            case "Technician": return <FaWrench />;
            default: return <FaTerminal />;
        }
    };

    const getBadge = () => {
        if (laboratory) return "LAB";
        switch (role) {
            case "Admin": return "ADMIN";
            case "User": return "USER";
            case "Technician": return "TECH";
            default: return "DASH";
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-blue-700/20 dark:shadow-yellow-400/20 border-2 border-blue-700/30 dark:border-yellow-400/30 min-h-[140px]">
            {/* Full Logo Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${logobanner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20px 20px, #c9a84c 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Dark Overlay - Lower z-index para hindi sumapaw */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/10 z-0" />

            {/* Main Content - Moderate z-index para nasa ibabaw ng overlay pero hindi masyadong mataas */}
            <div className="relative z-10 p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left Section - Title & Icon */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                            <span className="text-2xl md:text-3xl text-yellow-400">
                                {getIcon()}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
                                    {getTitle()}
                                </h1>
                                <span className="hidden sm:inline-block px-3 py-1 bg-yellow-400 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-yellow-400/30">
                                    {getBadge()}
                                </span>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-[0.15em] mt-1 drop-shadow">
                                {getSubtitle()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-yellow-400" />
                            Industrial Asset Management
                            <span className="w-1 h-1 rounded-full bg-yellow-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] text-white/50 font-black uppercase tracking-[0.2em]">
                        <span>BIPSU</span>
                        <span className="w-1 h-1 rounded-full bg-yellow-400/40" />
                        <span>Blue & Gold</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// BIPSU THEME COLORS - Blue, Yellow, White
// ============================================================
const BIPSU_COLORS = {
    // Primary BIPSU Colors
    blue: "#1a2a4a",
    blueLight: "#2a4a7a",
    blueDark: "#0f1a2e",
    blueBright: "#3b6cb0",

    yellow: "#c9a84c",
    yellowLight: "#e8d5a3",
    yellowDark: "#a8893a",
    yellowBright: "#f5c842",

    white: "#ffffff",
    whiteSmoke: "#f5f5f5",
    offWhite: "#fafafa",

    maroon: "#8b1a2b",
    cream: "#f5f0e6",
    darkNavy: "#0f1a2e",
    darkMaroon: "#5c0f1c",
    darkGold: "#a8893a"
};

// ============================================================
// PROFESSIONAL LINE GRAPH
// ============================================================
const ProfessionalLineGraph = ({ lineGraphData, isDark }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);

    const prepareChartData = () => {
        if (!lineGraphData) return [];

        const { equipmentAndRequestsByYear } = lineGraphData;
        if (!equipmentAndRequestsByYear) return [];

        const { labels = [], datasets = [] } = equipmentAndRequestsByYear;

        const combinedData = labels.map((label, index) => {
            const dataPoint = { year: label };
            datasets.forEach((dataset) => {
                const value = dataset.data?.[index] || 0;
                dataPoint[dataset.label] = value;
            });
            return dataPoint;
        });

        if (datasets.length === 2) {
            combinedData.forEach(item => {
                item.Total = (item[datasets[0].label] || 0) + (item[datasets[1].label] || 0);
            });
        }

        return combinedData;
    };

    const chartData = prepareChartData();
    const { equipmentAndRequestsByYear } = lineGraphData || {};
    const { datasets = [] } = equipmentAndRequestsByYear || {};

    const colors = {
        Equipment: {
            main: BIPSU_COLORS.blue,
            light: BIPSU_COLORS.blueLight,
            gradient: "url(#equipmentGradient)",
            bg: "rgba(26, 42, 74, 0.1)"
        },
        "Maintenance Requests": {
            main: BIPSU_COLORS.yellow,
            light: BIPSU_COLORS.yellowLight,
            gradient: "url(#requestsGradient)",
            bg: "rgba(201, 168, 76, 0.1)"
        },
        Total: {
            main: BIPSU_COLORS.blueBright,
            light: BIPSU_COLORS.blue,
            gradient: "url(#totalGradient)",
            bg: "rgba(59, 108, 176, 0.1)"
        }
    };

    const strokeColors = {
        Equipment: isDark ? BIPSU_COLORS.blueLight : BIPSU_COLORS.blue,
        "Maintenance Requests": isDark ? BIPSU_COLORS.yellowLight : BIPSU_COLORS.yellow,
        Total: isDark ? BIPSU_COLORS.blueBright : BIPSU_COLORS.blueBright
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 border-blue-700 dark:border-yellow-400 min-w-[200px]">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-yellow-400 mb-3">
                        {label}
                    </p>
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-700 last:border-0">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-sm font-black text-blue-700 dark:text-yellow-400">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <div className="w-full h-[350px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 10,
                                bottom: 10,
                            }}
                            onMouseMove={(e) => {
                                if (e.activeTooltipIndex !== undefined) {
                                    setActiveIndex(e.activeTooltipIndex);
                                    setHoveredData(chartData[e.activeTooltipIndex]);
                                }
                            }}
                            onMouseLeave={() => {
                                setActiveIndex(null);
                                setHoveredData(null);
                            }}
                        >
                            <defs>
                                <linearGradient id="equipmentGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BIPSU_COLORS.blue} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={BIPSU_COLORS.blue} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BIPSU_COLORS.yellow} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={BIPSU_COLORS.yellow} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDark ? "#334155" : "#e2e8f0"}
                                vertical={false}
                                opacity={0.5}
                            />

                            <XAxis
                                dataKey="year"
                                stroke={isDark ? "#94a3b8" : BIPSU_COLORS.blue}
                                tick={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fill: isDark ? "#94a3b8" : BIPSU_COLORS.blue
                                }}
                                axisLine={{ stroke: isDark ? "#334155" : BIPSU_COLORS.yellow }}
                                tickLine={false}
                                padding={{ left: 20, right: 20 }}
                            />

                            <YAxis
                                stroke={isDark ? "#94a3b8" : BIPSU_COLORS.blue}
                                tick={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    fill: isDark ? "#94a3b8" : BIPSU_COLORS.blue
                                }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                domain={[0, 'auto']}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Legend
                                verticalAlign="top"
                                height={40}
                                iconType="circle"
                                iconSize={10}
                                wrapperStyle={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: isDark ? "#e2e8f0" : BIPSU_COLORS.blue,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}
                            />

                            {datasets.map((dataset) => {
                                const label = dataset.label;
                                const color = colors[label] || { main: "#6b7280", light: "#9ca3af" };
                                const strokeColor = strokeColors[label] || color.main;

                                return (
                                    <Area
                                        key={label}
                                        type="monotone"
                                        dataKey={label}
                                        stroke={strokeColor}
                                        strokeWidth={3}
                                        fill={`url(#${label === "Equipment" ? "equipment" : "requests"}Gradient)`}
                                        fillOpacity={1}
                                        activeDot={{
                                            r: 8,
                                            strokeWidth: 3,
                                            stroke: isDark ? "#1e293b" : "#ffffff",
                                            fill: strokeColor
                                        }}
                                        dot={{
                                            r: 4,
                                            strokeWidth: 2,
                                            stroke: isDark ? "#1e293b" : "#ffffff",
                                            fill: strokeColor,
                                            activeDot: false
                                        }}
                                    />
                                );
                            })}
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <div className="text-center">
                            <FaChartLine className="text-4xl mx-auto mb-3 opacity-30 text-yellow-400" />
                            <p className="text-sm font-medium text-blue-700 dark:text-yellow-400">No data available</p>
                            <p className="text-xs text-slate-400 mt-1">Data will appear once available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// PROFESSIONAL BAR CHART
// ============================================================
const ProfessionalBarChart = ({ barChartData, isDark, chartType = "equipment" }) => {
    const prepareChartData = () => {
        if (!barChartData) return [];

        let rawData = [];
        let labelKey = '';
        let valueKey = '';

        switch (chartType) {
            case "equipment":
                rawData = barChartData.assignedByLaboratory || [];
                labelKey = 'laboratory';
                valueKey = 'totalEquipment';
                break;
            case "maintenance":
                rawData = barChartData.maintenanceByLaboratory || [];
                labelKey = 'laboratory';
                valueKey = 'count';
                break;
            case "requests":
                rawData = barChartData.requestsByLaboratory || [];
                labelKey = 'laboratory';
                valueKey = 'count';
                break;
            case "feedback":  // ADDED: New case for feedback
                rawData = barChartData.requestsByFeedbackType || [];
                labelKey = 'feedbackType';
                valueKey = 'count';
                break;
            default:
                rawData = barChartData.assignedByLaboratory || [];
                labelKey = 'laboratory';
                valueKey = 'totalEquipment';
        }

        if (!rawData.length) return [];

        const sortedData = [...rawData].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));

        return sortedData.map(item => ({
            name: item[labelKey] || 'Unknown',
            count: item[valueKey] || 0,
            laboratoryId: item.laboratoryId || ''
        }));
    };

    const chartData = prepareChartData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 border-blue-700 dark:border-yellow-400 min-w-[180px]">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-yellow-400 mb-2">
                        {label}
                    </p>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Count</span>
                        <span className="text-sm font-black text-blue-700 dark:text-yellow-400">
                            {data.count}
                        </span>
                    </div>
                    {data.laboratoryId && (
                        <div className="flex items-center justify-between py-1 border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                            <span className="text-[10px] font-medium text-slate-400">ID</span>
                            <span className="text-[10px] font-mono text-slate-500">{data.laboratoryId}</span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const chartColors = [
        BIPSU_COLORS.blue,
        BIPSU_COLORS.yellow,
        BIPSU_COLORS.blueLight,
        BIPSU_COLORS.yellowDark,
        BIPSU_COLORS.blueBright,
        BIPSU_COLORS.yellowLight
    ];

    return (
        <div className="w-full">
            <div className="w-full h-[350px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{
                                top: 20,
                                right: 30,
                                left: chartType === "feedback" ? 120 : 100, // Added: More space for feedback labels
                                bottom: 10,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDark ? "#334155" : "#e2e8f0"}
                                horizontal={true}
                                vertical={false}
                                opacity={0.5}
                            />

                            <XAxis
                                type="number"
                                stroke={isDark ? "#94a3b8" : BIPSU_COLORS.blue}
                                tick={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fill: isDark ? "#94a3b8" : BIPSU_COLORS.blue
                                }}
                                axisLine={{ stroke: isDark ? "#334155" : BIPSU_COLORS.yellow }}
                                tickLine={false}
                                domain={[0, 'auto']}
                            />

                            <YAxis
                                type="category"
                                dataKey="name"
                                stroke={isDark ? "#94a3b8" : BIPSU_COLORS.blue}
                                tick={{
                                    fontSize: chartType === "feedback" ? 12 : 11, // Added: Slightly larger font for feedback
                                    fontWeight: 600,
                                    fill: isDark ? "#94a3b8" : BIPSU_COLORS.blue
                                }}
                                axisLine={false}
                                tickLine={false}
                                width={chartType === "feedback" ? 110 : 90} // Added: Wider for feedback labels
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Bar
                                dataKey="count"
                                fill={isDark ? BIPSU_COLORS.yellow : BIPSU_COLORS.blue}
                                radius={[0, 6, 6, 0]}
                                maxBarSize={40}
                                label={{
                                    position: 'right',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fill: isDark ? '#94a3b8' : BIPSU_COLORS.blue
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={chartColors[index % chartColors.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <div className="text-center">
                            <FaChartBar className="text-4xl mx-auto mb-3 opacity-30 text-yellow-400" />
                            <p className="text-sm font-medium text-blue-700 dark:text-yellow-400">No data available</p>
                            <p className="text-xs text-slate-400 mt-1">No {chartType === "feedback" ? "feedback" : "laboratory"} data found</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// PIE CHART COMPONENT
// ============================================================
const DashboardPieCharts = ({ pieChartData, isDark }) => {
    if (!pieChartData) return null;

    const chartConfigs = [
        {
            key: 'equipmentAssignment',
            data: pieChartData.equipmentAssignment || [],
            title: 'Equipment Assignment',
            dataKey: 'status',
            valueKey: 'count'
        },
        {
            key: 'equipmentAvailability',
            data: pieChartData.equipmentAvailability || [],
            title: 'Equipment Availability',
            dataKey: 'status',
            valueKey: 'count'
        },
        {
            key: 'equipmentByCategory',
            data: pieChartData.equipmentByCategory || [],
            title: 'Equipment by Category',
            dataKey: 'category',
            valueKey: 'count'
        },
        {
            key: 'requestsByStatus',
            data: pieChartData.requestsByStatus || [],
            title: 'Requests by Status',
            dataKey: 'status',
            valueKey: 'count'
        },
        {
            key: 'requestFeedbackStatus',
            data: pieChartData.requestFeedbackStatus || [],
            title: 'Request Feedback Status',
            dataKey: 'status',
            valueKey: 'count'
        },
        {
            key: 'maintenanceTechnicianStatus',
            data: pieChartData.maintenanceTechnicianStatus || [],
            title: 'Maintenance Technician Status',
            dataKey: 'status',
            valueKey: 'count'
        }
    ];

    const activeCharts = chartConfigs.filter(config => config.data && config.data.length > 0);

    if (activeCharts.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <p className="text-sm font-medium">No pie chart data available</p>
            </div>
        );
    }

    const COLORS = [
        '#003366',
        '#FFD700',
        '#1a4b8c',
        '#f5d742',
        '#2a5fa8',
        '#e6c200',
        '#002244',
        '#ffdb4d'
    ];

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border-l-4 border-blue-700 dark:border-yellow-400">
                    <p className="text-sm font-bold text-blue-700 dark:text-yellow-400">
                        {data.name || data.status || data.category}
                    </p>
                    <p className="text-xs text-slate-500">
                        Count: <span className="font-bold text-blue-700 dark:text-yellow-400">{data.count || data.value}</span>
                    </p>
                    {data.percentage && (
                        <p className="text-xs text-slate-500">
                            Percentage: <span className="font-bold text-blue-700 dark:text-yellow-400">{data.percentage.toFixed(1)}%</span>
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text
                x={x}
                y={y}
                fill="#003366"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold dark:fill-yellow-400"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCharts.map((config, chartIndex) => {
                const chartData = config.data.map(item => ({
                    name: item[config.dataKey] || 'Unknown',
                    value: item[config.valueKey] || 0,
                    percentage: item.percentage || 0,
                    ...item
                }));

                const hasData = chartData.some(item => item.value > 0);

                if (!hasData) {
                    return (
                        <div
                            key={config.key}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-blue-700/20 dark:border-yellow-400/20 p-4"
                        >
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-yellow-400 text-center mb-2 border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
                                {config.title}
                            </h4>
                            <div className="h-[200px] flex items-center justify-center">
                                <p className="text-sm text-gray-400 dark:text-gray-500">No data available</p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={config.key}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-blue-700/20 dark:border-yellow-400/20 p-4 transition-all hover:shadow-xl hover:shadow-blue-700/10"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-yellow-400 text-center mb-2 border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
                            {config.title}
                        </h4>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                        label={renderCustomLabel}
                                        labelLine={false}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#fff"
                                                strokeWidth={1.5}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {chartData.map((item, index) => (
                                <div key={index} className="flex items-center gap-1 text-[8px] font-bold uppercase">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name}
                                    </span>
                                    <span className="text-blue-700 dark:text-yellow-400">
                                        ({item.value})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ============================================================
// ADMIN DASHBOARD - BLUE & YELLOW THEME with Avatar & Technician Tasks
// ============================================================
const AdminDashboard = ({ statisticsData }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [timeRange, setTimeRange] = useState("yearly");
    const [activeChart, setActiveChart] = useState("line");
    const [barChartType, setBarChartType] = useState("equipment");
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { technicianTasks } = useContext(MaintenanceRequestContext);

    const { pieCharts, lineGraphs, barCharts } = statisticsData || {};

    // Process technicianTasks data
    const processTechnicianTasks = () => {
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
    };

    const taskStats = processTechnicianTasks();

    // Carousel settings
    const itemsPerPage = 6;
    const totalPages = Math.ceil(taskStats.technicians.length / itemsPerPage);
    const maxIndex = totalPages - 1;

    const getInitials = (name) => {
        if (!name || name === 'N/A') return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name) => {
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
    };

    const handleAvatarClick = (technician) => {
        if (!technician.hasAssignedTasks) {
            return;
        }
        setSelectedTechnician(technician);
        setShowTaskModal(true);
    };

    const closeModal = () => {
        setShowTaskModal(false);
        setSelectedTechnician(null);
    };

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
                                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-700 text-yellow-400 shadow-lg hover:bg-blue-800 transition-all duration-300 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                    disabled={currentIndex === 0}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentIndex(Math.min(maxIndex, currentIndex + 1))}
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
                                        onClick={() => setCurrentIndex(idx)}
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
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
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

            {/* Chart Toggle */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveChart("line")}
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
                        onClick={() => setActiveChart("bar")}
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
                            { value: "feedback", label: "Feedback", icon: <FaStar size={12} /> } // ADDED: New feedback option
                        ].map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setBarChartType(type.value)}
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
                                        onClick={() => setTimeRange(range)}
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
                                                    "Feedback Distribution"} {/* UPDATED: Added Feedback option */}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                        {barChartType === "equipment" ? "Equipment by Laboratory" :
                                            barChartType === "maintenance" ? "Maintenance Requests by Laboratory" :
                                                barChartType === "requests" ? "Service Requests by Laboratory" :
                                                    "Feedback by Type"} {/* UPDATED: Added Feedback description */}
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
};

// ============================================================
// USER DASHBOARD - BIPSU BLUE & YELLOW THEME
// ============================================================
const UserDashboard = ({ onSelect, laboratoryData }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="relative overflow-hidden group py-16 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-blue-700/30 dark:border-yellow-400/30 flex flex-col items-center text-center shadow-2xl shadow-blue-700/10"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <FaTools size={120} className="text-blue-700 dark:text-yellow-400" />
        </div>
        <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-yellow-400 mb-6 shadow-lg shadow-blue-700/30">
            <FaTools size={24} />
        </div>
        <h3 className="text-2xl font-black text-blue-700 dark:text-yellow-400 uppercase tracking-tighter mb-2">Equipment Management</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 font-medium italic">
            "Access and update your department's asset list for maintenance and tracking."
        </p>
        <button
            onClick={() => onSelect(laboratoryData)}
            className="px-12 py-4 bg-blue-700 hover:bg-blue-800 text-yellow-400 font-black rounded-2xl shadow-xl shadow-blue-700/30 hover:shadow-blue-700/50 transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-3"
        >
            Initialize Equipment List <FaChevronRight />
        </button>
    </motion.div>
);

// ============================================================
// TECHNICIAN DASHBOARD
// ============================================================
const TechnicianDashboard = ({ technicianStats }) => {
    const {
        dashboardCards,
        pieCharts,
        lineGraphs,
        technicianEquipment,
        scope
    } = technicianStats || {};

    const {
        totalMaintenanceSchedules = 0,
        totalOverdueSchedules = 0,
        totalUpcomingSchedules = 0,
        totalMaintenanceRequests = 0,
        completedRequests = 0
    } = dashboardCards || {};

    const {
        maintenanceByScheduleType = [],
        maintenanceTechnicianStatus = [],
        requestFeedbackStatus = [],
        requestTechnicianStatus = [],
        requestsByStatus = []
    } = pieCharts || {};

    const {
        maintenanceAndRequestsByMonth = [],
        maintenanceAndRequestsByYear = [],
        maintenanceByMonth = [],
        maintenanceByYear = [],
        requestsByMonth = [],
        requestsByYear = []
    } = lineGraphs || {};

    const COLORS = {
        blue: '#003366',
        yellow: '#FFD700',
        lightBlue: '#4A90D9',
        gold: '#F5A623',
        green: '#2ECC71',
        red: '#E74C3C',
        purple: '#9B59B6',
        orange: '#E67E22',
        teal: '#1ABC9C',
        pink: '#E91E63'
    };

    const PIE_COLORS = [
        COLORS.blue,
        COLORS.yellow,
        COLORS.lightBlue,
        COLORS.gold,
        COLORS.green,
        COLORS.red,
        COLORS.purple,
        COLORS.orange,
        COLORS.teal,
        COLORS.pink
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-blue-700/20 dark:border-yellow-400/20">
                    <p className="font-bold text-blue-700 dark:text-yellow-400">{payload[0].name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Count: <span className="font-bold">{payload[0].value}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderPieChart = (data, title, height = 220) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-[220px] text-gray-400 dark:text-gray-500">
                    <p className="text-sm">No data available</p>
                </div>
            );
        }

        const hasData = data.some(item => item.count > 0);
        if (!hasData) {
            return (
                <div className="flex items-center justify-center h-[220px] text-gray-400 dark:text-gray-500">
                    <p className="text-sm">No data to display</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percentage }) => percentage > 0 ? `${percentage}%` : ''}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '11px' }}
                        formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const renderLineChart = () => {
        if (!maintenanceAndRequestsByMonth || maintenanceAndRequestsByMonth.length === 0) {
            return (
                <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                    <p className="text-sm">No data available</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={maintenanceAndRequestsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="monthName"
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #003366',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="maintenanceSchedules"
                        stroke={COLORS.blue}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                        name="Maintenance Schedules"
                    />
                    <Line
                        type="monotone"
                        dataKey="maintenanceRequests"
                        stroke={COLORS.yellow}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                        name="Maintenance Requests"
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 p-4 shadow-sm">
                    <h4 className="font-bold text-blue-700 dark:text-yellow-400 uppercase text-xs tracking-widest mb-2 text-center border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
                        Requests by Status
                    </h4>
                    {renderPieChart(requestsByStatus)}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 p-4 shadow-sm">
                    <h4 className="font-bold text-blue-700 dark:text-yellow-400 uppercase text-xs tracking-widest mb-2 text-center border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
                        Feedback Status
                    </h4>
                    {renderPieChart(requestFeedbackStatus)}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 p-4 shadow-sm">
                    <h4 className="font-bold text-blue-700 dark:text-yellow-400 uppercase text-xs tracking-widest mb-2 text-center border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
                        Technician Status
                    </h4>
                    {renderPieChart(maintenanceTechnicianStatus)}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 p-6 shadow-sm">
                <h4 className="font-bold text-blue-700 dark:text-yellow-400 uppercase text-xs tracking-widest mb-4 text-center border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
                    Maintenance & Requests by Month
                </h4>
                {renderLineChart()}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 overflow-hidden shadow-sm">
                <div className="p-6">
                    <TechnicianTable />
                </div>
            </div>

            {scope && (
                <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-blue-700/10 dark:border-yellow-400/10 pt-4 mt-4">
                    <p>Role: {scope.role} | User ID: {scope.userId} | {scope.filterApplied}</p>
                </div>
            )}
        </div>
    );
};

// ============================================================
// LABORATORY VIEW
// ============================================================
const LaboratoryView = ({ laboratory }) => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-blue-700/20 dark:border-yellow-400/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
            <Laboratory laboratoryId={laboratory._id} />
        </div>
    </div>
);

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const getDashboardTitle = (role) => {
    const titles = {
        Admin: "System Overview",
        User: "Department Portal",
        Technician: "Technician Console"
    };
    return titles[role] || "Dashboard";
};

export default Dashboard;