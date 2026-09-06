import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

export default DashboardPieCharts;