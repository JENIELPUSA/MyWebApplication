<<<<<<< HEAD
import { MdPerson, MdBuild, MdScience, MdApartment, MdCheckCircle, MdHourglassEmpty } from "react-icons/md";
import React, { useState, useContext, useEffect } from "react";
=======
import { MdPerson, MdBuild, MdScience, MdApartment } from "react-icons/md";
import React, { useState, useContext,useEffect } from "react";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import { EquipmentDisplayContext } from "../components/Context/EquipmentContext/DisplayContext";
import { LaboratoryDisplayContext } from "../components/Context/Laboratory/Display";
import { UserDisplayContext } from "./Context/User/DisplayUser";
import { AuthContext } from "../components/Context/AuthContext";
import { FilterSpecificAssignContext } from "./Context/AssignContext/FilterSpecificAssign.jsx";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest.jsx";

function DashboardCard() {
<<<<<<< HEAD
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
=======
    const [piedataTechnician,setPiedatatoTechnician]=useState([])
  const { laboratoryData } = useContext(FilterSpecificAssignContext);
  const { request } = useContext(RequestDisplayContext);
  const { role, fullName } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const { equipment } = useContext(EquipmentDisplayContext);
  const { laboratories } = useContext(LaboratoryDisplayContext);
  const { users } = useContext(UserDisplayContext);
  const [pending, setPending] = useState([]);
  const [under, setUnder] = useState([]);
  const [Accomplish, setAccomplish] = useState([]);
  const [Assigning,setAssigning]=useState([])
  const [availables,setAvailables]=useState([])

  // Save request to localStorage when it changes
  useEffect(() => {
    const filteredPiedata = request.filter((item) => {
      const techName =
        typeof item.Technician === "string"
          ? item.Technician.trim().toLowerCase()
          : "";
      const targetName = fullName.trim().toLowerCase();
      return item.UserId && techName === targetName;
    });

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    setPiedatatoTechnician(filteredPiedata);
  }, [request, fullName]);

  useEffect(() => {
<<<<<<< HEAD
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
=======
    if (role === "Admin") {
      const availableEquipmentCount = (
        equipment?.filter((item) => item.status === "Available") ?? []
      );

      setAvailables(availableEquipmentCount.length)
    } else {
      const Assigned = request.filter(
        (item) =>
          typeof item.Technician === "string" &&
          item.Technician.toLowerCase().trim() === fullName.toLowerCase().trim()
      );
      const undermaintenance = piedataTechnician.filter(
        (item) => item?.Status === "Under Maintenance"
      );
      const countPending = piedataTechnician.filter(
        (item) => item?.Status === "Pending"
      );
      const countSuccess = piedataTechnician.filter(
        (item) => item?.Status === "Success"
      );
      setAssigning(Assigned.length)
      setUnder(undermaintenance.length);
      setPending(countPending.length);
      setAccomplish(countSuccess.length);
    }
  }, [role, request, piedataTechnician]);

  return (
    <div className="xs:m-4 lg:m-10 font-poppins">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-wrap -mx-6 xs:-mt-2 lg:mt-4 h-full ">
        {role === "Admin" ? (
          <>
            {/* User Card - Only for Admin */}
            <div className="w-full xs:px-3 sm:px:4 lg:px:4 sm:w-1/2 xl:w-1/3 xs:-mb-1 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-lg rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-indigo-600 bg-opacity-75">
                  <MdPerson className="h-8 w-8 text-white" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                    {users?.length}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-200">
                    Users
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Card */}
            <div className="xs:px-3 sm:px:4 lg:px:4 w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 sm:mt-0 xs:-mb-1 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-lg rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-orange-600 bg-opacity-75">
                  <MdBuild className="h-8 w-8 text-white" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                    {availables}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-200">
                    Available Equipment
                  </div>
                </div>
              </div>
            </div>

            {/* Laboratories Card */}
            <div className="xs:px-3 sm:px:4 lg:px:4 w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0 xs:mb-1 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-lg rounded-xl bg-gradient-to-r from-pink-500 to-pink-700 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-pink-600 bg-opacity-75">
                  <MdScience className="h-8 w-8 text-white" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                    {laboratories?.length}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-200">
                    Laboratories
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : role === "User" ? (
          <>
            {/* User Dashboard */}
            <div className="xs:px-3 sm:px:4 lg:px:4 w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0 xs:-mb-1 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl bg-white/30 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdApartment className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl  font-semibold text-gray-800">
                    {laboratoryData?.departmentName}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    Department
                  </div>
                </div>
              </div>
            </div>

            <div className="xs:px-3 sm:px:4 lg:px:4 w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0 xs:-mb-1 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl bg-white/30 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdScience className="h-8 w-8 text-gray-700" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {laboratoryData?.laboratoryName}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    Laboratory
                  </div>
                </div>
              </div>
            </div>

            <div className="xs:px-3 sm:px:4 lg:px:4 w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0  xs:mb-2 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl bg-white/30 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-700" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {laboratoryData?.equipmentsCount}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    No. Equipments
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : role === "Technician" ? (
          <>
            {/* User Card - Only for Admin */}
            <div className="xs:px-3 sm:px:4 lg:px:4 w-full sm:w-1/2 xl:w-1/3 xs:mb-4 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl  bg-gray-100 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {Assigning}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    {" "}
                    Assigned
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xs:px-3 sm:px:4 lg:px:4 sm:w-1/2 xl:w-1/3 xs:mb-4 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl  bg-gray-100 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {Accomplish}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    {" "}
                    Accomplished
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xs:px-3 sm:px:4 lg:px:4 sm:w-1/2 xl:w-1/3 xs:mb-3 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl  bg-gray-100 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {under}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    {" "}
                    Under Maintenance
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default DashboardCard;
=======
export default DashboardCard;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
