import React, { useEffect, useRef, useState, useContext } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import { AuthContext } from "./components/Context/AuthContext";
<<<<<<< HEAD
import { FaChartLine, FaMicrochip, FaDatabase } from "react-icons/fa";
=======
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

function MonthlyTableGraph() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { authToken } = useContext(AuthContext);
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
=======

  console.log("Data",monthlyData)
  console.log("labels",monthLabels)

  useEffect(() => {
    const savedRequests = localStorage.getItem("maintenanceData");
    const savedLabels = localStorage.getItem("maintenanceLabels");

    if (savedRequests) {
      setMonthlyData(JSON.parse(savedRequests));
    }

    if (savedLabels) {
      setMonthLabels(JSON.parse(savedLabels));
    }
  }, []);


   useEffect(() => {
      if (monthlyData && Array.isArray(monthlyData)) {
        //mahalaga na ma clear ito after e logout
        localStorage.setItem("maintenanceData", JSON.stringify(monthlyData));
      }
    }, [monthlyData]);


     useEffect(() => {
        if (monthLabels && Array.isArray(monthLabels)) {
          localStorage.setItem("maintenanceLabels", JSON.stringify(monthLabels));
        }
      }, [monthLabels]);



>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) return;
<<<<<<< HEAD
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/monthly-requests`,
=======
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/v1/MaintenanceRequest/monthly-requests`,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
<<<<<<< HEAD
        const sorted = res.data.sort((a, b) => new Date(a._id) - new Date(b._id));
        const totals = sorted.map((item) => item.total);
        const labels = sorted.map((item) => {
          const date = new Date(item._id + "-01");
          return date.toLocaleString("default", { month: "short" }).toUpperCase(); // Naka-uppercase for technical look
        });

        setMonthlyData(totals);
        setMonthLabels(labels);
        localStorage.setItem("maintenanceData", JSON.stringify(totals));
        localStorage.setItem("maintenanceLabels", JSON.stringify(labels));
      } catch (err) {
        console.error("Error fetching monthly data:", err);
        const savedData = localStorage.getItem("maintenanceData");
        const savedLabels = localStorage.getItem("maintenanceLabels");
        if (savedData) setMonthlyData(JSON.parse(savedData));
        if (savedLabels) setMonthLabels(JSON.parse(savedLabels));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authToken]);

  useEffect(() => {
    if (!chartRef.current || monthlyData.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstance.current) chartInstance.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(30, 58, 138, 0.2)"); // Navy blue transparent
    gradient.addColorStop(1, "rgba(250, 204, 21, 0)"); // Fade to yellow (transparent)
=======
        const sorted = res.data.sort(
          (a, b) => new Date(a._id) - new Date(b._id)
        );
        setMonthlyData(sorted.map((item) => item.total));
        setMonthLabels(
          sorted.map((item) => {
            const date = new Date(item._id + "-01");
            return date.toLocaleString("default", { month: "short" });
          })
        );
      } catch (err) {
        console.error("Error fetching monthly data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || monthlyData.length === 0) return;
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) chartInstance.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
<<<<<<< HEAD
            label: "SYSTEM REQUESTS",
            data: monthlyData,
            borderColor: "#1e3a8a", // Navy Blue
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: "#facc15", // Yellow accent
            pointBorderColor: "#1e3a8a",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
=======
            label: "Requests",
            data: monthlyData,
            borderColor: "#3B82F6",
            backgroundColor: gradient,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.4,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          },
        ],
      },
      options: {
        responsive: true,
<<<<<<< HEAD
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e3a8a",
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 12, weight: 'black' },
            cornerRadius: 12,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => ` UNITS: ${context.parsed.y}`
            }
=======
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "#1E3A8A",
            titleColor: "#fff",
            bodyColor: "#fff",
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          },
        },
        scales: {
          y: {
            beginAtZero: true,
<<<<<<< HEAD
            grid: { color: "rgba(226, 232, 240, 0.8)", drawBorder: false },
            ticks: {
              color: "#94a3b8",
              font: { size: 10, weight: '800' },
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: "#64748b",
              font: { size: 10, weight: '800' },
            },
=======
            ticks: { stepSize: 5, color: "#6B7280" },
            grid: { color: "#E5E7EB" },
          },
          x: {
            ticks: { color: "#6B7280" },
            grid: { display: false },
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          },
        },
      },
    });
<<<<<<< HEAD

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [monthlyData, monthLabels]);

  const totalRequests = monthlyData.reduce((sum, val) => sum + val, 0);

  return (
    <div className="relative flex flex-col bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 overflow-hidden group hover:border-[#1e3a8a] transition-all duration-500">
      
      {/* Technical Header Accent */}
      <div className="h-2 bg-[#1e3a8a] w-full flex">
         <div className="h-full w-1/3 bg-yellow-400" />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaMicrochip className="text-yellow-500" size={14} />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Activity Analytics
              </h2>
            </div>
            <h3 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">
              Maintenance <span className="text-yellow-500">Flow</span>
            </h3>
          </div>

          {!loading && (
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aggregate</p>
                <p className="text-lg font-black text-[#1e3a8a] leading-none">{totalRequests}</p>
              </div>
              <div className="p-2 bg-[#1e3a8a] text-white rounded-lg shadow-lg shadow-blue-900/20">
                <FaDatabase size={12} />
              </div>
            </div>
          )}
        </div>

        {/* Chart Container */}
        <div className="w-full h-64 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1e3a8a] rounded-full animate-spin mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Data...</p>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 border-2 border-dashed border-slate-50 rounded-3xl">
              <FaChartLine size={30} className="mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Telemetry Recorded</p>
            </div>
          ) : (
            <canvas ref={chartRef} className="w-full h-full" />
          )}
        </div>

        {/* Technical Footer */}
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status: Active</span>
          </div>
          <p className="text-[9px] font-black text-[#1e3a8a] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
            Report Cycle: 12 Months
          </p>
        </div>
=======
  }, [monthlyData, monthLabels]);

  return (
    <div className="flex flex-col items-center bg-white dark:bg-neutral-700 rounded-lg shadow-md p-3 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50">
      <h2 className="text-lg font-semibold text-center mb-4 dark:text-gray-800">
        Monthly Request Overview
      </h2>
      <div className="w-full h-44 flex justify-center items-center">
        <canvas ref={chartRef} className="w-4/5 h-full" />
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default MonthlyTableGraph;
=======
export default MonthlyTableGraph;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
