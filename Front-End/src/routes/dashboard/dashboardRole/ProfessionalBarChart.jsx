import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FaChartBar } from "react-icons/fa";

const BIPSU_COLORS = {
    blue: "#1a2a4a",
    blueLight: "#2a4a7a",
    blueDark: "#0f1a2e",
    blueBright: "#3b6cb0",
    yellow: "#c9a84c",
    yellowLight: "#e8d5a3",
    yellowDark: "#a8893a",
    yellowBright: "#f5c842",
};

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
            case "feedback":
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
                                left: chartType === "feedback" ? 120 : 100,
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
                                    fontSize: chartType === "feedback" ? 12 : 11,
                                    fontWeight: 600,
                                    fill: isDark ? "#94a3b8" : BIPSU_COLORS.blue
                                }}
                                axisLine={false}
                                tickLine={false}
                                width={chartType === "feedback" ? 110 : 90}
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

export default ProfessionalBarChart;