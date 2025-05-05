import React, { useEffect, useRef, useContext } from "react";
import ApexCharts from "apexcharts";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest";

function DashboardPieChart() {
  const { request } = useContext(RequestDisplayContext);
  const chartRef = useRef(null);

  // Save request to localStorage when it changes
  useEffect(() => {
    if (request && Array.isArray(request)) {
      localStorage.setItem("maintenanceRequests", JSON.stringify(request));
    }
  }, [request]);

  //for example may value na siya na "HeadOffice" na galing sa return sa taas
  //pag save sa local storage
  useEffect(() => {
    JSON.parse(localStorage.getItem("maintenanceRequests"));
  }, []);

  const countUnder = (
    Array.isArray(request)
      ? request.filter((item) => item?.Status === "Under Maintenance")
      : []
  ).length;

  const countPending = (
    Array.isArray(request)
      ? request.filter((item) => item?.Status === "Pending")
      : []
  ).length;

  const countSuccess = (
    Array.isArray(request)
      ? request.filter((item) => item?.Status === "Success")
      : []
  ).length;

  const total = countPending + countUnder + countSuccess;

  const success = (countSuccess / total) * 100;

  const undermaintenance = (countUnder / total) * 100;

  const Pending = (countPending / total) * 100;

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
    </div>
  );
}

export default DashboardPieChart;
