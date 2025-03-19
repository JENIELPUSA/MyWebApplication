import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

function DashboardPieChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return; // Prevent errors if ref is undefined

    const chartConfig = {
      series: [30, 40, 30], // Pending, Ongoing, Success
      chart: {
        type: "donut",
        height: 300, // Ensure this is always a number
      },
      labels: ["Pending", "Ongoing", "Success"],
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
  }, []);

  return (
    <div className="flex flex-col items-center bg-white dark:bg-neutral-700 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3 dark:text-gray-500">
        Task Status Overview
      </h2>
      <div ref={chartRef} className="w-full min-h-[300px]"></div>
    </div>
  );
}

export default DashboardPieChart;
