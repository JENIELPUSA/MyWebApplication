import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

function MonthlyTableGraph() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [monthlyData, setMonthlyData] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/monthly-requests`);
        const sorted = res.data.sort((a, b) => new Date(a._id) - new Date(b._id));
        setMonthlyData(sorted.map(item => item.total));
        setMonthLabels(sorted.map(item => {
          const date = new Date(item._id + "-01");
          return date.toLocaleString('default', { month: 'short' });
        }));
      } catch (err) {
        console.error("Error fetching monthly data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || monthlyData.length === 0) return;
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) chartInstance.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Requests',
          data: monthlyData,
          borderColor: '#3B82F6',
          backgroundColor: gradient,
          fill: true,
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#1E3A8A',
            titleColor: '#fff',
            bodyColor: '#fff',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 5, color: '#6B7280' },
            grid: { color: '#E5E7EB' },
          },
          x: {
            ticks: { color: '#6B7280' },
            grid: { display: false },
          },
        }
      }
    });
  }, [monthlyData, monthLabels]);

  return (
    <div className="flex flex-col items-center bg-white dark:bg-neutral-700 rounded-lg shadow-md p-3 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50">
      <h2 className="text-lg font-semibold text-center mb-4 dark:text-gray-800">
        Monthly Request Overview
      </h2>
      <div className="w-full h-44 flex justify-center items-center">
        <canvas ref={chartRef} className="w-4/5 h-full" />
      </div>
    </div>
  );
}

export default MonthlyTableGraph;
