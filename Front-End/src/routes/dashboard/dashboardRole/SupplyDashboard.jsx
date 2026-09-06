import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import {
    Activity,
    Tag,
    Monitor,
    TrendingUp,
    CalendarDays
} from "lucide-react";

// ============================================================
// THEME COLORS - BLUE AND YELLOW ONLY
// ============================================================
const COLORS = {
    blue1: '#003366',    // Dark Blue
    blue2: '#1a4a7a',    // Medium Dark Blue
    blue3: '#2d6da8',    // Medium Blue
    blue4: '#4a90d9',    // Light Blue
    blue5: '#6ba3e0',    // Lighter Blue
    yellow1: '#FFD700',  // Bright Yellow
    yellow2: '#F5A623',  // Dark Yellow
    yellow3: '#FFE44D',  // Light Yellow
    yellow4: '#FFF8E1',  // Very Light Yellow
    white: '#FFFFFF',
    gray: '#6B7280'
};

// PIE CHART COLORS - Blue and Yellow alternating
const PIE_COLORS = [
    COLORS.blue1,    // Dark Blue
    COLORS.yellow1,  // Bright Yellow
    COLORS.blue3,    // Medium Blue
    COLORS.yellow2,  // Dark Yellow
    COLORS.blue2,    // Medium Dark Blue
    COLORS.yellow3,  // Light Yellow
    COLORS.blue4,    // Light Blue
    COLORS.yellow1,  // Bright Yellow
    COLORS.blue5,    // Lighter Blue
    COLORS.yellow2   // Dark Yellow
];

// LINE CHART COLORS - Blue and Yellow only
const LINE_COLORS = [
    COLORS.blue1,    // Dark Blue
    COLORS.yellow1,  // Bright Yellow
    COLORS.blue3,    // Medium Blue
    COLORS.yellow2,  // Dark Yellow
    COLORS.blue4     // Light Blue
];

// ============================================================
// SUPPLY DASHBOARD - Equipment Statistics
// ============================================================
const SupplyDashboard = ({ supplyStatistics }) => {
    // ============================================================
    // EXTRACT DATA FROM PROPS
    // ============================================================
    const {
        cards = [],
        charts = {},
        recentlyAdded = [],
        summary = {}
    } = supplyStatistics || {};

    const {
        statusPie = [],
        categoryPie = [],
        brandPie = [],
        lineChart = {}
    } = charts;

    const {
        labels = [],
        datasets = []
    } = lineChart;

    // ============================================================
    // CUSTOM TOOLTIP
    // ============================================================
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const total = statusPie.reduce((sum, item) => sum + item.value, 0) || 
                         categoryPie.reduce((sum, item) => sum + item.value, 0) || 
                         brandPie.reduce((sum, item) => sum + item.value, 0);
            const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border-2 border-blue1/20 dark:border-blue1/40">
                    <p className="font-bold text-blue1 dark:text-blue-400">{data.label || data.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Count: <span className="font-bold">{data.value}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Percentage: <span className="font-bold">{percentage}%</span>
                    </p>
                    {data.available !== undefined && data.notAvailable !== undefined && (
                        <>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Available: <span className="font-bold">{data.available}</span>
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Not Available: <span className="font-bold">{data.notAvailable}</span>
                            </p>
                        </>
                    )}
                </div>
            );
        }
        return null;
    };

    // ============================================================
    // RENDER PIE CHART - BLUE AND YELLOW ONLY
    // ============================================================
    const renderPieChart = (data, height = 220) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-[220px] text-gray-400 dark:text-gray-500">
                    <p className="text-sm">No data available</p>
                </div>
            );
        }

        const hasData = data.some(item => item.value > 0);
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
                        dataKey="value"
                        nameKey="label"
                        label={({ label, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
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

    // ============================================================
    // RENDER LINE CHART - BLUE AND YELLOW ONLY
    // ============================================================
    const renderLineChart = () => {
        if (!labels || labels.length === 0 || !datasets || datasets.length === 0) {
            return (
                <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                    <p className="text-sm">No data available</p>
                </div>
            );
        }

        // Format data for line chart
        const lineData = labels.map((label, index) => {
            const dataPoint = { month: label };
            datasets.forEach(dataset => {
                dataPoint[dataset.label] = dataset.data[index] || 0;
            });
            return dataPoint;
        });

        return (
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        className="dark:stroke-gray-400"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => value}
                    />
                    <YAxis
                        stroke="#6b7280"
                        className="dark:stroke-gray-400"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '2px solid #003366',
                            borderRadius: '8px',
                        }}
                        itemStyle={{ color: '#1f2937' }}
                        labelStyle={{ color: '#003366', fontWeight: 'bold' }}
                    />
                    <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                        formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
                    />
                    {datasets.map((dataset, index) => (
                        <Line
                            key={index}
                            type="monotone"
                            dataKey={dataset.label}
                            stroke={LINE_COLORS[index % LINE_COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 5, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                            activeDot={{ r: 8, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                            name={dataset.label}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    };

    // ============================================================
    // RENDER RECENTLY ADDED TABLE
    // ============================================================
    const renderRecentlyAdded = () => {
        if (!recentlyAdded || recentlyAdded.length === 0) {
            return (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p>No equipment added recently</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-blue1/20 dark:border-blue1/40">
                            <th className="text-left py-3 px-3 text-xs font-bold text-blue1 dark:text-blue-400 uppercase tracking-wider">Brand</th>
                            <th className="text-left py-3 px-3 text-xs font-bold text-blue1 dark:text-blue-400 uppercase tracking-wider">Serial Number</th>
                            <th className="text-left py-3 px-3 text-xs font-bold text-blue1 dark:text-blue-400 uppercase tracking-wider">Category</th>
                            <th className="text-left py-3 px-3 text-xs font-bold text-blue1 dark:text-blue-400 uppercase tracking-wider">Status</th>
                            <th className="text-left py-3 px-3 text-xs font-bold text-blue1 dark:text-blue-400 uppercase tracking-wider">Date Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentlyAdded.map((item, index) => (
                            <tr key={item.id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-medium">{item.brandName || item.brand}</td>
                                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-mono text-xs">{item.serialNumber}</td>
                                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300">{item.category}</td>
                                <td className="py-2.5 px-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        item.status === 'Available' 
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                                    {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // ============================================================
    // CHECK IF THERE IS DATA TO DISPLAY
    // ============================================================
    const hasData = statusPie.length > 0 || 
                    categoryPie.length > 0 || 
                    brandPie.length > 0 || 
                    recentlyAdded.length > 0 ||
                    (labels && labels.length > 0);

    if (!hasData) {
        return null;
    }

    // ============================================================
    // MAIN RENDER
    // ============================================================
    return (
        <div className="space-y-6">
            {/* Pie Charts Row - BLUE AND YELLOW ONLY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue1/20 dark:border-blue1/40 p-4 shadow-sm dark:shadow-gray-900/30">
                    <h4 className="font-bold text-blue1 dark:text-blue-400 uppercase text-xs tracking-widest mb-2 text-center border-b-2 border-blue1/20 dark:border-blue1/40 pb-2 flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4 text-blue1 dark:text-blue-400" />
                        Status Distribution
                    </h4>
                    {renderPieChart(statusPie)}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue1/20 dark:border-blue1/40 p-4 shadow-sm dark:shadow-gray-900/30">
                    <h4 className="font-bold text-blue1 dark:text-blue-400 uppercase text-xs tracking-widest mb-2 text-center border-b-2 border-blue1/20 dark:border-blue1/40 pb-2 flex items-center justify-center gap-2">
                        <Tag className="w-4 h-4 text-blue1 dark:text-blue-400" />
                        Category Distribution
                    </h4>
                    {renderPieChart(categoryPie)}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue1/20 dark:border-blue1/40 p-4 shadow-sm dark:shadow-gray-900/30">
                    <h4 className="font-bold text-blue1 dark:text-blue-400 uppercase text-xs tracking-widest mb-2 text-center border-b-2 border-blue1/20 dark:border-blue1/40 pb-2 flex items-center justify-center gap-2">
                        <Monitor className="w-4 h-4 text-blue1 dark:text-blue-400" />
                        Brand Distribution
                    </h4>
                    {renderPieChart(brandPie)}
                </div>
            </div>

            {/* Line Chart - BLUE AND YELLOW ONLY */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue1/20 dark:border-blue1/40 p-6 shadow-sm dark:shadow-gray-900/30">
                <h4 className="font-bold text-blue1 dark:text-blue-400 uppercase text-xs tracking-widest mb-4 text-center border-b-2 border-blue1/20 dark:border-blue1/40 pb-2 flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue1 dark:text-blue-400" />
                    Equipment Monthly Trend
                </h4>
                {renderLineChart()}
            </div>

            {/* Recently Added Equipment Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue1/20 dark:border-blue1/40 p-6 shadow-sm dark:shadow-gray-900/30">
                <h4 className="font-bold text-blue1 dark:text-blue-400 uppercase text-xs tracking-widest mb-4 text-center border-b-2 border-blue1/20 dark:border-blue1/40 pb-2 flex items-center justify-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue1 dark:text-blue-400" />
                    Recently Added Equipment
                </h4>
                {renderRecentlyAdded()}
            </div>
        </div>
    );
};

export default SupplyDashboard;