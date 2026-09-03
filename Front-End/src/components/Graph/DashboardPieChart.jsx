import React, { useEffect, useRef, useContext, useMemo } from "react";
import ApexCharts from "apexcharts";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";
import { AuthContext } from "../../contexts/AuthContext";
import { FaShieldAlt, FaCircle, FaDatabase } from "react-icons/fa";

// ✅ HELPER FUNCTION: Safe display of any value
const getDisplayValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "object") {
    // Check for common display properties
    if (value.DepartmentName) return value.DepartmentName;
    if (value.departmentName) return value.departmentName;
    if (value.name) return value.name;
    if (value.Name) return value.Name;
    if (value.laboratoryName) return value.laboratoryName;
    if (value.LaboratoryName) return value.LaboratoryName;
    if (value.FirstName) {
      return value.LastName ? `${value.FirstName} ${value.LastName}` : value.FirstName;
    }
    // Handle status objects
    if (value.Status) return value.Status;
    if (value.RequestStatus) return value.RequestStatus;
    // If object has _id and no displayable property, return the id
    if (value._id) return value._id;
    // Last resort: stringify
    return JSON.stringify(value);
  }
  return "";
};

// ✅ Helper function to safely trim a value
const safeTrim = (value) => {
  const displayValue = getDisplayValue(value);
  return typeof displayValue === "string" ? displayValue.trim().toLowerCase() : "";
};

// ✅ Helper function to safely compare technician names
const isTechnicianMatch = (itemTechnician, targetName) => {
  const techName = safeTrim(itemTechnician);
  const target = safeTrim(targetName);
  return techName === target;
};

function DashboardPieChart() {
  const { request = [] } = useContext(MaintenanceRequestContext);
  const { fullName, role } = useContext(AuthContext);
  const chartRef = useRef(null);

  const stats = useMemo(() => {
    // ✅ Use safe comparison for filtering
    const dataSource = role === "Admin" 
      ? request 
      : request.filter(item => {
          // Safely get technician name from object or string
          const techName = safeTrim(item.Technician);
          const targetName = safeTrim(fullName);
          
          // Check if technician matches the target name
          return item.UserId && techName === targetName;
        });

    // ✅ Safely get status values
    const counts = {
      pending: dataSource.filter(i => {
        const status = getDisplayValue(i.Status);
        return status === "Pending";
      }).length,
      under: dataSource.filter(i => {
        const status = getDisplayValue(i.Status);
        return status === "Under Maintenance";
      }).length,
      success: dataSource.filter(i => {
        const status = getDisplayValue(i.Status);
        return status === "Success";
      }).length,
    };

    const total = counts.pending + counts.under + counts.success;
    
    return {
      ...counts,
      total,
      series: total > 0 ? [counts.pending, counts.under, counts.success] : [0, 0, 0]
    };
  }, [request, fullName, role]);

  useEffect(() => {
    if (!chartRef.current) return;

    const options = {
      series: stats.series,
      chart: {
        type: "pie",
        height: 280,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      labels: ["PENDING QUEUE", "IN PROGRESS", "ACCOMPLISHED"],
      colors: ["#facc15", "#1e3a8a", "#10b981"],
      stroke: {
        show: true,
        width: 2,
        colors: ["#ffffff"]
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '10px',
          fontWeight: '900',
          colors: ['#fff', '#fff', '#fff']
        },
        dropShadow: { enabled: false }
      },
      legend: { show: false },
      tooltip: {
        style: { fontSize: '10px', fontWeight: '900' },
        y: { formatter: (val) => `${val} UNITS` }
      }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
    return () => chart.destroy();
  }, [stats]);

  return (
    <div className="relative w-full max-w-md bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden group hover:border-[#1e3a8a] transition-all duration-500">
      
      {/* Registry Top Bar */}
      <div className="bg-[#1e3a8a] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 rounded-lg text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
            <FaDatabase size={12} />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Asset Distribution</h2>
            <p className="text-[8px] text-blue-200 font-bold uppercase tracking-widest">
               {role === "Admin" ? "System-Wide Status" : "Personal Assigned Units"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Pie Chart Area */}
        <div className="relative flex items-center justify-center mb-8">
          <div ref={chartRef} className="w-full"></div>
        </div>
        {/* Total Aggregate Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Registry Count</p>
          <p className="text-sm font-black text-[#1e3a8a] tracking-tighter">{stats.total} UNITS</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPieChart;