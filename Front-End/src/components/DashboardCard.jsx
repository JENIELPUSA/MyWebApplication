import { MdPerson, MdBuild, MdScience, MdApartment } from "react-icons/md";
import React, { useState, useContext } from "react";
import { EquipmentDisplayContext } from "../components/Context/EquipmentContext/DisplayContext";
import { LaboratoryDisplayContext } from "../components/Context/Laboratory/Display";
import { UserDisplayContext } from "./Context/User/DisplayUser";
import { AuthContext } from "../components/Context/AuthContext";
import { FilterSpecificAssignContext } from "./Context/AssignContext/FilterSpecificAssign.jsx";
import { RequestDisplayContext } from "./Context/MaintenanceRequest/DisplayRequest.jsx";

function DashboardCard() {
  const { laboratoryData } = useContext(FilterSpecificAssignContext);
  const { request } = useContext(RequestDisplayContext);
  const { role } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const { equipment } = useContext(EquipmentDisplayContext);
  const { laboratories } = useContext(LaboratoryDisplayContext);
  const { users } = useContext(UserDisplayContext);

  const availableEquipmentCount = (
    equipment?.filter((item) => item.status === "Available") ?? []
  ).length;

  const countUnder = (
    Array.isArray(request)
      ? request.filter((item) => item?.Status === "Under Maintenance")
      : []
  ).length;

  const countSuccess = (
    Array.isArray(request)
      ? request.filter((item) => item?.Status === "Success")
      : []
  ).length;

  return (
    <div className="xs:m-3 font-poppins bg-white p-4 rounded-lg">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-wrap -mx-6 xs:-mt-5 lg:mt-4 h-full ">
        {role === "Admin" ? (
          <>
            {/* User Card - Only for Admin */}
            <div className="w-full px-6 sm:w-1/2 xl:w-1/3 xs:-mb-1 sm:mb-6 lg:mb-6 xs:pt-4 sm:pt-0">
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
            <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 sm:mt-0 xs:-mb-1 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-lg rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-orange-600 bg-opacity-75">
                  <MdBuild className="h-8 w-8 text-white" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                    {availableEquipmentCount}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-200">
                    Available Equipment
                  </div>
                </div>
              </div>
            </div>

            {/* Laboratories Card */}
            <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0 xs:mb-1 sm:mb-6 lg:mb-6">
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
            <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0 xs:-mb-1 sm:mb-6 lg:mb-6">
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


            <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0 xs:-mb-1 sm:mb-6 lg:mb-6">
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


            <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0  xs:mb-2 sm:mb-6 lg:mb-6">
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
            <div className="w-full px-6 sm:w-1/2 xl:w-1/3 xs:mb-4 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl  bg-gray-100 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {request?.length}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    {" "}
                    Assigned
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-6 sm:w-1/2 xl:w-1/3 xs:mb-4 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl  bg-gray-100 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {countSuccess}
                  </h4>
                  <div className="text-sm sm:text-base text-gray-800">
                    {" "}
                    Accomplished
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-6 sm:w-1/2 xl:w-1/3 xs:mb-3 sm:mb-6 lg:mb-6">
              <div className="flex items-center px-5 py-6 shadow-xl rounded-xl  bg-gray-100 backdrop-blur-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 h-full">
                <div className="p-3 rounded-full bg-white/50 shadow-md">
                  <MdBuild className="h-8 w-8 text-gray-800" />
                </div>
                <div className="mx-5">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                    {countUnder}
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
      </div>
    </div>
  );
}

export default DashboardCard;
