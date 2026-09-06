import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddRequest from "./AddRequest";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

const MaintenanceModalDisplay = ({ Lab, Equip, onClose }) => {
  const { authToken, role } = useContext(AuthContext);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;
    fetchRequest();
  }, [authToken]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest?Equipments=${Equip._id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setRequest(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTechnicianName = (technician) => {
    if (!technician) return "---";
    if (typeof technician === "string") return technician;
    if (typeof technician === "object" && technician.FirstName && technician.LastName) {
      return `${technician.FirstName} ${technician.LastName}`;
    }
    return "---";
  };

  const getDisplayValue = (value) => {
    if (!value) return "---";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") {
      if (value.name) return value.name;
      if (value.DepartmentName) return value.DepartmentName;
      if (value.departmentName) return value.departmentName;
      if (value.categoryName) return value.categoryName;
      if (value.Brand) return value.Brand;
      if (value.FirstName && value.LastName) {
        return `${value.FirstName} ${value.LastName}`;
      }
      return JSON.stringify(value);
    }
    return "---";
  };

  const equipment = Array.isArray(Equip) ? Equip[0] : Equip;
  const lab = Array.isArray(Lab) ? Lab[0] : Lab;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center flex-shrink-0 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">Maintenance Log System</h2>
            <p className="text-sm text-blue-100">Equipment Service History</p>
          </div>
          <button 
            onClick={handleClose} 
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Device Info */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-shrink-0">
          <div>
            <p className="text-gray-500 font-semibold text-xs uppercase">Equipment</p>
            <p className="text-gray-800 font-medium">
              {getDisplayValue(equipment?.Brand)} / {getDisplayValue(equipment?.categoryName)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-semibold text-xs uppercase">Serial Number</p>
            <p className="text-gray-800 font-mono">{equipment?.SerialNumber || "---"}</p>
          </div>
          <div>
            <p className="text-gray-500 font-semibold text-xs uppercase">Laboratory</p>
            <p className="text-gray-800 font-medium">{getDisplayValue(lab?.departmentName)}</p>
          </div>
          <div>
            <p className="text-gray-500 font-semibold text-xs uppercase">In-Charge</p>
            <p className="text-gray-800 font-medium">{getDisplayValue(lab?.encharge)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-gray-700 text-white">
                <tr>
                  <th className="p-3 pl-4">Date</th>
                  <th className="p-3">Ref #</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 text-center">
                    {role === "User" && (
                      <button 
                        onClick={() => setFormModalOpen(true)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        + Add
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  <tr><td colSpan={7} className="p-10 text-center"><LoadingTableSpinner /></td></tr>
                ) : request.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400">No Records Found</td></tr>
                ) : (
                  request.map((data) => (
                    <tr key={data._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 pl-4 text-gray-500">{formatDateTime(data.DateTime)}</td>
                      <td className="p-3 font-mono text-blue-600">{data.Ref}</td>
                      <td className="p-3 max-w-[200px] truncate">{data.Description}</td>
                      <td className="p-3">{getTechnicianName(data.Technician)}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          data.Status === 'Success' ? 'bg-green-100 text-green-700' : 
                          data.Status === 'Pending' ? 'bg-red-100 text-red-700' : 
                          data.Status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {data.Status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 max-w-[200px] truncate">
                        {data.Remarks || "---"}
                      </td>
                      <td className="p-3 text-center">
                        {role === "Admin" && (
                          <button className="text-red-400 hover:text-red-600">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 py-2 text-center border-t border-gray-200 flex-shrink-0 rounded-b-lg">
          <p className="text-xs text-gray-500">Maintenance Verification System • Lab Official Log</p>
        </div>
      </div>

      {/* Add Request Modal */}
      {isFormModalOpen && (
        <AddRequest
          isOpen={isFormModalOpen}
          EquipmentID={equipment?._id}
          DepartmentID={lab?.departmentId || lab?.DepartmentId}
          LaboratoryID={lab?.laboratoryId || lab?.LaboratoryId}
          onClose={() => setFormModalOpen(false)}
          onAddRequest={(newData) => setRequest(prev => [...prev, newData])}
        />
      )}
    </div>
  );
};

export default MaintenanceModalDisplay;