import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import TechnicianTable from "../../../components/Technician/TechnicianTable";

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

export default TechnicianDashboard;