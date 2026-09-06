import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ComposedChart } from "recharts";
import { FaChartLine } from "react-icons/fa";

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

const ProfessionalLineGraph = ({ lineGraphData, isDark }) => {
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

export default ProfessionalLineGraph;