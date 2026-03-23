<<<<<<< HEAD
import React, { useEffect, useRef, useContext, useMemo } from "react";
import ApexCharts from "apexcharts";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest";
import { AuthContext } from "./Context/AuthContext";
import { FaShieldAlt, FaCircle, FaDatabase } from "react-icons/fa";

function DashboardPieChart() {
  const { request = [] } = useContext(RequestDisplayContext);
  const { fullName, role } = useContext(AuthContext);
  const chartRef = useRef(null);

  const stats = useMemo(() => {
    const dataSource = role === "Admin" 
      ? request 
      : request.filter(item => {
          const techName = item.Technician?.trim().toLowerCase() || "";
          const targetName = fullName?.trim().toLowerCase() || "";
          return item.UserId && techName === targetName;
        });

    const counts = {
      pending: dataSource.filter(i => i.Status === "Pending").length,
      under: dataSource.filter(i => i.Status === "Under Maintenance").length,
      success: dataSource.filter(i => i.Status === "Success").length,
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
        type: "pie", // Ginawang 'pie' mula sa 'donut'
        height: 280,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      labels: ["PENDING QUEUE", "IN PROGRESS", "ACCOMPLISHED"],
      colors: ["#facc15", "#1e3a8a", "#10b981"], // Yellow, Navy, Emerald
      stroke: {
        show: true,
        width: 2,
        colors: ["#ffffff"] // Puting linya sa pagitan ng slices para sa "clean cut" look
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
=======
import React, { useEffect, useRef, useContext,useState } from "react";
import ApexCharts from "apexcharts";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest";
import { AuthContext } from "./Context/AuthContext";
function DashboardPieChart() {
  const [piedataTechnician,setPiedatatoTechnician]=useState([])
  const { request } = useContext(RequestDisplayContext);
  const chartRef = useRef(null);
  const {fullName,role}=useContext(AuthContext)
  const [pending,setPending]=useState([])
  const[under,setUnder]=useState([])
  const[Accomplish,setAccomplish]=useState([])

  // Save request to localStorage when it changes
  useEffect(() => {
    const filteredPiedata = request.filter((item) => {
      const techName = typeof item.Technician === "string" ? item.Technician.trim().toLowerCase() : "";
      const targetName = fullName.trim().toLowerCase();
      return item.UserId && techName === targetName;
    });

    setPiedatatoTechnician(filteredPiedata)
  }, [request,fullName]);

  //for example may value na siya na "HeadOffice" na galing sa return sa taas
  //pag save sa local storage
  useEffect(() => {
    JSON.parse(localStorage.getItem("maintenanceRequests"));
  }, []);

  useEffect(() => {
    if (role === "Admin" && Array.isArray(request)) {
      const undermaintenance = request.filter((item) => item?.Status === "Under Maintenance");
      const countPending = request.filter((item) => item?.Status === "Pending");
      const countSuccess = request.filter((item) => item?.Status === "Success");
  
      setUnder(undermaintenance.length);
      setPending(countPending.length);
      setAccomplish(countSuccess.length);
    }else{
      const undermaintenance = piedataTechnician.filter((item) => item?.Status === "Under Maintenance");
      const countPending = piedataTechnician.filter((item) => item?.Status === "Pending");
      const countSuccess = piedataTechnician.filter((item) => item?.Status === "Success");
      setUnder(undermaintenance.length);
      setPending(countPending.length);
      setAccomplish(countSuccess.length);
    }
  }, [role, request,piedataTechnician]);
  


  const total = pending + under + Accomplish;

  const success = (Accomplish / total) * 100;

  const undermaintenance = (under / total) * 100;

  const Pending = (pending / total) * 100;

  useEffect(() => {
    if (!chartRef.current) return; // Prevent errors if ref is undefined
    const chartConfig = {
      series: [Pending, undermaintenance, success], // Pending, Ongoing, Success
      chart: {
        type: "donut",
        height: 300, // Ensure this is always a number
      },
      labels: ["Pending", "Under Maintenance", "Success"],
      colors: ["#FFBB28", "#0088FE", "#00C49F"],
      legend: {
        position: "bottom",
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
      },
      tooltip: {
        theme: "dark",
      },
    };

    const chart = new ApexCharts(chartRef.current, chartConfig);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [Pending, undermaintenance, success]); // Re-render chart when any of these change

  return (
    <div className="flex flex-col items-center bg-white dark:bg-neutral-700 rounded-lg shadow-md p-4 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50">
      <h2 className="text-lg font-semibold mb-3 dark:text-gray-500">
        Task Status Overview
      </h2>
      <div ref={chartRef} className="w-full min-h-[300px]"></div>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </div>
  );
}

<<<<<<< HEAD
export default DashboardPieChart;
=======
export default DashboardPieChart;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
