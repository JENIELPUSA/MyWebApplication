import { MdPerson, MdBuild, MdScience, MdApartment, MdCheckCircle, MdHourglassEmpty } from "react-icons/md";
import React, { useState, useContext, useEffect } from "react";
import { EquipmentDisplayContext } from "../components/Context/EquipmentContext/DisplayContext";
import { LaboratoryDisplayContext } from "../components/Context/Laboratory/Display";
import { UserDisplayContext } from "./Context/User/DisplayUser";
import { AuthContext } from "../components/Context/AuthContext";
import { FilterSpecificAssignContext } from "./Context/AssignContext/FilterSpecificAssign.jsx";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest.jsx";

function DashboardCard() {
  const [piedataTechnician, setPiedatatoTechnician] = useState([]);
  const { laboratoryData } = useContext(FilterSpecificAssignContext);
  const { request } = useContext(RequestDisplayContext);
  const { role, FirstName, LastName } = useContext(AuthContext); 
  const { equipment } = useContext(EquipmentDisplayContext);
  const { laboratories } = useContext(LaboratoryDisplayContext);
  const { users } = useContext(UserDisplayContext);
  
  const [pending, setPending] = useState(0);
  const [under, setUnder] = useState(0);
  const [Accomplish, setAccomplish] = useState(0);
  const [Assigning, setAssigning] = useState(0);
  const [availables, setAvailables] = useState(0);

  const fullName = `${FirstName ?? ""} ${LastName ?? ""}`.trim();

  useEffect(() => {
    const safeRequests = Array.isArray(request) ? request : [];
    const filteredPiedata = safeRequests.filter((item) => {
      const techName = typeof item?.Technician === "string" ? item.Technician.trim().toLowerCase() : "";
      return item?.UserId && techName === fullName.toLowerCase();
    });
    setPiedatatoTechnician(filteredPiedata);
  }, [request, fullName]);

  useEffect(() => {
    const safeEquipment = Array.isArray(equipment) ? equipment : [];
    const safeRequests = Array.isArray(request) ? request : [];

    if (role === "Admin") {
      setAvailables(safeEquipment.filter((item) => item?.status === "Available").length);
    } 
    else if (role === "Technician") {
      const targetName = fullName.toLowerCase();
      const Assigned = safeRequests.filter((item) => typeof item?.Technician === "string" && item.Technician.toLowerCase().trim() === targetName);
      setUnder(piedataTechnician.filter(item => item?.Status === "Under Maintenance").length);
      setPending(piedataTechnician.filter(item => item?.Status === "Pending").length);
      setAccomplish(piedataTechnician.filter(item => item?.Status === "Success").length);
      setAssigning(Assigned.length);
    }
  }, [role, equipment, request, piedataTechnician, fullName]);

  // Reusable Card Component para sa Consistency
  const CardItem = ({ icon: Icon, label, value, iconColor = "text-blue-900" }) => (
    <div className="w-full px-3 sm:w-1/2 xl:w-1/3 mb-6">
      <div className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div className="p-4 rounded-xl bg-yellow-400 shadow-lg shadow-yellow-200 group-hover:scale-110 transition-transform">
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
        <div className="mx-5">
          <h4 className="text-2xl font-black text-gray-800 leading-none">
            {value}
          </h4>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="xs:m-2 lg:m-4 font-poppins">
      <div className="flex flex-wrap -mx-3 mt-4">
        {role === "Admin" ? (
          <>
            <CardItem icon={MdPerson} label="Total Users" value={users?.length ?? 0} />
            <CardItem icon={MdBuild} label="Available Units" value={availables} />
            <CardItem icon={MdScience} label="Laboratories" value={laboratories?.length ?? 0} />
          </>
        ) : role === "User" ? (
          <>
            <CardItem icon={MdApartment} label="Department" value={laboratoryData?.departmentName ?? "N/A"} />
            <CardItem icon={MdScience} label="Laboratory" value={laboratoryData?.labName ?? "N/A"} />
            <CardItem icon={MdBuild} label="Equipments" value={laboratoryData?.equipmentCount ?? 0} />
          </>
        ) : role === "Technician" ? (
          <>
            <CardItem icon={MdHourglassEmpty} label="Pending" value={pending} />
            <CardItem icon={MdBuild} label="Ongoing" value={under} />
            <CardItem icon={MdCheckCircle} label="Success" value={Accomplish} />
          </>
        ) : (
          <div className="w-full text-center py-10 text-gray-400 font-bold italic">
            Initializing Dashboard...
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard;