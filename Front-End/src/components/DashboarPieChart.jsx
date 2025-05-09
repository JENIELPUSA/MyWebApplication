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
    </div>
  );
}

export default DashboardPieChart;
