import React, { useState, useMemo, useContext } from "react";
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
  CartesianGrid,
} from "recharts";

import { MaintenanceRequestContext } from "../../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";

// Theme color palette used across charts, calendar, and table
const COLORS = {
  blue: "#003366",
  yellow: "#FFD700",
  lightBlue: "#4A90D9",
  gold: "#F5A623",
  green: "#2ECC71",
  red: "#E74C3C",
  purple: "#9B59B6",
  orange: "#E67E22",
  teal: "#1ABC9C",
  pink: "#E91E63",
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
  COLORS.pink,
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Default sample line graph data when technicianStats prop is not provided
const DEFAULT_MONTHLY_TRENDS = [
  { monthName: "Jul", maintenanceSchedules: 5, maintenanceRequests: 7 },
  { monthName: "Aug", maintenanceSchedules: 8, maintenanceRequests: 9 },
  { monthName: "Sep", maintenanceSchedules: 6, maintenanceRequests: 6 },
  { monthName: "Oct", maintenanceSchedules: 10, maintenanceRequests: 12 },
  { monthName: "Nov", maintenanceSchedules: 4, maintenanceRequests: 6 },
];

// Helper to normalize schedule dates into YYYY-MM-DD in Asia/Manila timezone
const normalizeDateStr = (item) => {
  if (!item || typeof item !== "object") return "";
  if (
    typeof item.scheduledDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.scheduledDate)
  ) {
    return item.scheduledDate;
  }
  if (item.SetSchedule) {
    try {
      const parsed = new Date(item.SetSchedule);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
      }
    } catch {
      return "";
    }
  }
  return "";
};

// Helper to format SetSchedule ISO timestamp to Manila time
const formatScheduleTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const parsed = new Date(isoString);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });
  } catch {
    return "N/A";
  }
};

// Helper to clean up whitespace in names
const formatName = (name) =>
  typeof name === "string" && name.trim()
    ? name.replace(/\s+/g, " ").trim()
    : "N/A";

/**
 * Custom tooltip component for Recharts PieChart segments.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percentage =
      item?.payload?.percentage !== undefined
        ? `${item.payload.percentage}%`
        : "N/A";

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-blue-700/20 dark:border-yellow-400/20">
        <p className="font-bold text-blue-700 dark:text-yellow-400">
          {item.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Count: <span className="font-bold">{item.value}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Percentage: <span className="font-bold">{percentage}</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Self-contained ScheduleCalendar component displaying monthly scheduled maintenance.
 */
const ScheduleCalendar = ({ schedulesData = [] }) => {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });

  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedItem, setSelectedItem] = useState(null);

  const schedules = useMemo(() => {
    const source = Array.isArray(schedulesData) ? schedulesData : [];

    return source
      .filter((item) => item && typeof item === "object")
      .map((item, idx) => ({
        ...item,
        _id: item._id || item.id || idx,
        scheduledDate: normalizeDateStr(item),
      }));
  }, [schedulesData]);

  const schedulesByDate = useMemo(() => {
    const map = {};
    schedules.forEach((item) => {
      if (!item.scheduledDate) return;
      if (!map[item.scheduledDate]) {
        map[item.scheduledDate] = [];
      }
      map[item.scheduledDate].push(item);
    });
    return map;
  }, [schedules]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;
      cells.push({ day, dateStr, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      cells.push({ day, dateStr, isCurrentMonth: true });
    }

    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;
      cells.push({ day, dateStr, isCurrentMonth: false });
    }

    return cells;
  }, [year, month]);

  const selectedDateSchedules = useMemo(
    () => schedules.filter((item) => item.scheduledDate === selectedDate),
    [schedules, selectedDate],
  );

  return (
    <div className="space-y-4">
      {/* Month Navigation Controls */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() =>
              setCurrentMonthDate(new Date(year, month - 1, 1))
            }
            className="px-2.5 py-1 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => {
              const currentNow = new Date();
              setCurrentMonthDate(
                new Date(currentNow.getFullYear(), currentNow.getMonth(), 1),
              );
              setSelectedDate(
                currentNow.toLocaleDateString("en-CA", {
                  timeZone: "Asia/Manila",
                }),
              );
            }}
            className="px-2.5 py-1 text-xs font-medium border-x border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentMonthDate(new Date(year, month + 1, 1))
            }
            className="px-2.5 py-1 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell) => {
          const dayEvents = schedulesByDate[cell.dateStr] || [];
          const isSelected = cell.dateStr === selectedDate;

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => {
                setSelectedDate(cell.dateStr);
                setSelectedItem(dayEvents[0] || null);
              }}
              className={`min-h-[54px] p-1 rounded-lg border text-left transition-all flex flex-col justify-between ${
                !cell.isCurrentMonth
                  ? "bg-slate-50/50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-800/60 text-slate-400"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400"
              } ${
                isSelected
                  ? "ring-2 ring-blue-700 dark:ring-yellow-400 border-blue-700 dark:border-yellow-400"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold">{cell.day}</span>
                {dayEvents.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-700 dark:bg-yellow-400" />
                )}
              </div>
              {dayEvents.length > 0 && (
                <span className="text-[10px] font-medium truncate w-full px-1 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-slate-800 dark:text-yellow-300">
                  {dayEvents[0].Request || dayEvents[0].request || "Scheduled"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Agenda */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Schedules on {selectedDate}
          </span>
          <span className="text-xs font-semibold text-blue-700 dark:text-yellow-400">
            {selectedDateSchedules.length} item(s)
          </span>
        </div>

        {selectedDateSchedules.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {selectedDateSchedules.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedItem?._id === item._id
                    ? "border-blue-700 bg-blue-50/60 dark:border-yellow-400 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>{item.Request || item.request || "N/A"}</span>
                  <span className="text-[11px] text-slate-500">
                    {formatScheduleTime(item.SetSchedule)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Equipment:{" "}
                  <span className="font-medium">
                    {item.Equipment || item.equipment || "N/A"}
                  </span>{" "}
                  • {item.Department || "N/A"} - {item.Laboratory || "N/A"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Encharge: {formatName(item.Encharge || item.encharge)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
            No maintenance scheduled for this date.
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Self-contained TechnicianTable component displaying up to 10 assigned schedules.
 */
const TechnicianTable = ({ rowsData = [] }) => {
  const MAX_VISIBLE_ROWS = 10;

  const { visibleRows, totalCount } = useMemo(() => {
    if (!Array.isArray(rowsData)) {
      return { visibleRows: [], totalCount: 0 };
    }

    const mappedRows = rowsData
      .filter((item) => item && typeof item === "object")
      .map((row, index) => ({
        id: row._id || row.id || index,
        ref: row.ref || row.Ref || "N/A",
        equipment: row.equipment || row.Equipment || "N/A",
        request: row.request || row.Request || "N/A",
        location:
          row.location ||
          `${row.Department || "N/A"} - ${row.Laboratory || "N/A"}`,
        encharge: formatName(row.encharge || row.Encharge),
        scheduledDate: normalizeDateStr(row) || "N/A",
      }));

    return {
      visibleRows: mappedRows.slice(0, MAX_VISIBLE_ROWS),
      totalCount: mappedRows.length,
    };
  }, [rowsData]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-blue-700 dark:text-yellow-400 uppercase text-xs tracking-widest">
          Assigned Maintenance Schedule Table
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {visibleRows.length} of {totalCount}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase">
              <th className="py-2.5 px-3">Ref</th>
              <th className="py-2.5 px-3">Equipment</th>
              <th className="py-2.5 px-3">Request</th>
              <th className="py-2.5 px-3">Department / Lab</th>
              <th className="py-2.5 px-3">Encharge</th>
              <th className="py-2.5 px-3">Scheduled Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-blue-700 dark:text-yellow-400">
                    {row.ref}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    {row.equipment}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {row.request}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {row.location}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {row.encharge}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {row.scheduledDate}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 px-3 text-center text-slate-500 dark:text-slate-400"
                >
                  No maintenance schedule records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// TECHNICIAN DASHBOARD
// ============================================================
const TechnicianDashboard = ({ technicianStats }) => {
  const { pieCharts, lineGraphs, technicianEquipment, scope } =
    technicianStats || {};

  const {
    maintenanceTechnicianStatus = [],
    requestFeedbackStatus = [],
    requestsByStatus = [],
  } = pieCharts || {};

  const { technicianSchedule = [], technicianTaskLoading } = useContext(
    MaintenanceRequestContext,
  );

  const { maintenanceAndRequestsByMonth = [] } = lineGraphs || {};

  const lineChartData =
    Array.isArray(maintenanceAndRequestsByMonth) &&
    maintenanceAndRequestsByMonth.length > 0
      ? maintenanceAndRequestsByMonth
      : DEFAULT_MONTHLY_TRENDS;

  const schedulesData = useMemo(() => {
    if (Array.isArray(technicianSchedule) && technicianSchedule.length > 0) {
      return technicianSchedule;
    }
    if (Array.isArray(technicianStats?.schedules)) {
      return technicianStats.schedules;
    }
    if (Array.isArray(technicianStats?.schedules?.data)) {
      return technicianStats.schedules.data;
    }
    return [];
  }, [technicianSchedule, technicianStats]);

  const tableRowsData = useMemo(() => {
    if (Array.isArray(technicianSchedule) && technicianSchedule.length > 0) {
      return technicianSchedule;
    }
    if (Array.isArray(technicianEquipment) && technicianEquipment.length > 0) {
      return technicianEquipment;
    }
    return [];
  }, [technicianSchedule, technicianEquipment]);

  /**
   * Renders a responsive PieChart with fallback empty states.
   */
  const renderPieChart = (data, height = 220) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[220px] text-gray-400 dark:text-gray-500">
          <p className="text-sm">No data available</p>
        </div>
      );
    }

    const hasData = data.some((item) => Number(item?.count) > 0);
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
            label={({ status, percentage }) =>
              percentage > 0 ? `${percentage}%` : ""
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry?.status || index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            formatter={(value) => (
              <span className="text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  /**
   * Renders a responsive LineChart comparing monthly schedules vs requests.
   */
  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={lineChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="monthName"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #003366",
              borderRadius: "8px",
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
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Main Grid: Charts on the Left, Schedule Calendar on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Pie Charts & Line Chart */}
        <div className="lg:col-span-7 space-y-6">
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
        </div>

        {/* RIGHT COLUMN: Schedule Calendar */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 p-4 shadow-sm">
          <h4 className="font-bold text-blue-700 dark:text-yellow-400 uppercase text-xs tracking-widest mb-3 text-center border-b border-blue-700/20 dark:border-yellow-400/20 pb-2">
            Schedule Calendar
          </h4>
          {technicianTaskLoading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
              Loading schedules...
            </p>
          ) : (
            <ScheduleCalendar schedulesData={schedulesData} />
          )}
        </div>
      </div>

      {/* Technician Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-700/20 dark:border-yellow-400/20 overflow-hidden shadow-sm">
        <div className="p-6">
          <TechnicianTable rowsData={tableRowsData} />
        </div>
      </div>

      {/* Scope Metadata Footer */}
      {scope && (
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-blue-700/10 dark:border-yellow-400/10 pt-4 mt-4">
          <p>
            Role: {scope.role} | User ID: {scope.userId} | {scope.filterApplied}
          </p>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;