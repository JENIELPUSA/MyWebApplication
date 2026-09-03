import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddRequest from "./AddRequest";
import { AuthContext } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import {
  FaClock,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaTools,
  FaTimes,
  FaPlus,
  FaTrashAlt,
  FaEdit
} from "react-icons/fa";

const MaintenanceModalDisplay = ({ Lab, Equip, onClose }) => {
  const [animateExit, setAnimateExit] = useState(false);
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

  console.log("request", request);

  const handleCloseTrigger = () => {
    setAnimateExit(true);
    setTimeout(onClose, 300);
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // ✅ Helper function para sa pag-display ng technician name
  const getTechnicianName = (technician) => {
    if (!technician) return "---";
    // Kung string (direct name)
    if (typeof technician === "string") return technician;
    // Kung object na may FirstName at LastName
    if (typeof technician === "object" && technician.FirstName && technician.LastName) {
      return `${technician.FirstName} ${technician.LastName}`;
    }
    return "---";
  };

  // ✅ NEW: Helper function to safely display any value (string or object)
  const getDisplayValue = (value) => {
    if (!value) return "---";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") {
      // Check for common display properties
      if (value.name) return value.name;
      if (value.DepartmentName) return value.DepartmentName;
      if (value.departmentName) return value.departmentName;
      if (value.categoryName) return value.categoryName;
      if (value.Brand) return value.Brand;
      if (value.FirstName && value.LastName) {
        return `${value.FirstName} ${value.LastName}`;
      }
      // If none of the above, return JSON string (for debugging)
      return JSON.stringify(value);
    }
    return "---";
  };

  // ✅ Safe access to Equip and Lab data
  const equipment = Array.isArray(Equip) ? Equip[0] : Equip;
  const lab = Array.isArray(Lab) ? Lab[0] : Lab;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
        onClick={handleCloseTrigger}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={animateExit ? { opacity: 0, scale: 0.98, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-300 flex flex-col font-['Poppins']"
      >
        {/* Modern Blue Header */}
        <div className="bg-[#1e3a8a] px-8 py-5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-400 rounded-xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaTools size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight font-['Poppins']">Maintenance <span className="text-yellow-400">Log System</span></h2>
              <p className="text-[11px] text-blue-200 uppercase font-bold tracking-[0.2em] font-['Poppins']">Equipment Service History</p>
            </div>
          </div>
          <button onClick={handleCloseTrigger} className="bg-white/10 hover:bg-red-500 w-12 h-12 rounded-full flex items-center justify-center transition-all">
            <FaTimes size={18}/>
          </button>
        </div>

        {/* Device Snapshot Bar (Industrial Look) - FIXED */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px] flex-shrink-0 font-['Poppins']">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Equipment</p>
            <p className="text-slate-700 font-black truncate text-[15px]">
              {getDisplayValue(equipment?.Brand)} / {getDisplayValue(equipment?.categoryName)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Serial Number</p>
            <p className="text-blue-600 font-mono font-bold tracking-widest text-[15px]">{equipment?.SerialNumber || "---"}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Laboratory</p>
            <p className="text-slate-700 font-black text-[15px]">{getDisplayValue(lab?.departmentName)}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">In-Charge</p>
            <p className="text-slate-700 font-black text-[15px]">{getDisplayValue(lab?.encharge)}</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-6 flex-grow overflow-hidden flex flex-col bg-white">
          <div className="flex-grow overflow-auto rounded-2xl border border-slate-200 shadow-inner custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-800 text-white text-[12px] uppercase tracking-widest font-['Poppins']">
                <tr>
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Ref #</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Remarks</th>
                  <th className="p-4 text-center">
                    {role === "User" && (
                      <button 
                        onClick={() => setFormModalOpen(true)}
                        className="bg-yellow-400 text-blue-900 p-2.5 rounded-lg hover:scale-110 shadow-sm transition-transform font-['Poppins']"
                      >
                        <FaPlus size={15} />
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px] font-bold text-slate-600 font-['Poppins']">
                {loading ? (
                  <tr><td colSpan={7} className="p-20 text-center"><LoadingTableSpinner /></td></tr>
                ) : request.length === 0 ? (
                  <tr><td colSpan={7} className="p-20 text-center text-slate-400 uppercase tracking-widest font-['Poppins'] text-[16px]">No Records Found</td></tr>
                ) : (
                  request.map((data) => (
                    <tr key={data._id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                      <td className="p-4 pl-6 font-normal text-slate-400 italic font-['Poppins'] text-[13px]">{formatDateTime(data.DateTime)}</td>
                      <td className="p-4 font-mono text-blue-600 text-[14px]">{data.Ref}</td>
                      <td className="p-4 font-['Poppins'] text-[14px]">
                        <div className="max-w-[200px] truncate group relative">
                          {data.Description}
                          <FaEdit className="inline ml-2 text-slate-300 hover:text-blue-500 cursor-pointer text-[14px]" />
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-['Poppins'] text-[14px]">
                        {getTechnicianName(data.Technician)}
                      </td>
                      <td className="p-4 text-center font-['Poppins']">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black border font-['Poppins'] ${
                          data.Status === 'Success' ? 'bg-green-100/50 text-green-700 border-green-200' : 
                          data.Status === 'Pending' ? 'bg-red-100/50 text-red-700 border-red-200' : 
                          data.Status === 'Assigned' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                          'bg-orange-100/50 text-orange-700 border-orange-200'
                        }`}>
                          {data.Status === 'Success' ? <FaCheckCircle size={14} /> : 
                           data.Status === 'Assigned' ? <FaUserCheck size={14} /> :
                           <FaClock size={14} />}
                          {data.Status}
                        </span>
                      </td>
                      {/* ✅ NEW: Remarks Column with Tooltip */}
                      <td className="p-4 font-['Poppins']">
                        <div className="max-w-[200px] truncate group relative">
                          <span className="text-slate-600 font-normal text-[14px]">
                            {data.Remarks || "---"}
                          </span>
                          {data.Remarks && data.Remarks.length > 15 && (
                            <div className="absolute z-20 bottom-full left-0 mb-2 hidden group-hover:block bg-slate-800 text-white text-[12px] p-3 rounded-lg shadow-xl max-w-xs whitespace-normal break-words">
                              {data.Remarks}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {role === "Admin" && (
                          <button className="text-slate-300 hover:text-red-500 transition-colors">
                            <FaTrashAlt size={16} />
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

        {/* Signature Yellow Footer */}
        <div className="bg-yellow-400 py-3 text-center border-t border-yellow-500 flex-shrink-0">
          <p className="text-[10px] font-black text-blue-900 uppercase tracking-[0.5em] font-['Poppins']">Maintenance Verification System • Lab Official Log</p>
        </div>
      </motion.div>

      {/* Nested Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};

export default MaintenanceModalDisplay;