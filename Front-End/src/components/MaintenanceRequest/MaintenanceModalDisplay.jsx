import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddRequest from "./AddRequest";
import { AuthContext } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
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
  const { fetchRequestData } = useContext(RequestDisplayContext);
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

  const handleCloseTrigger = () => {
    setAnimateExit(true);
    setTimeout(onClose, 300);
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
        onClick={handleCloseTrigger}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={animateExit ? { opacity: 0, scale: 0.98, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-300 flex flex-col"
      >
        {/* Modern Blue Header */}
        <div className="bg-[#1e3a8a] px-6 py-4 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 rounded-xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaTools size={20} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">Maintenance <span className="text-yellow-400">Log System</span></h2>
              <p className="text-[9px] text-blue-200 uppercase font-bold tracking-[0.2em]">Equipment Service History</p>
            </div>
          </div>
          <button onClick={handleCloseTrigger} className="bg-white/10 hover:bg-red-500 w-10 h-10 rounded-full flex items-center justify-center transition-all">
            <FaTimes size={14}/>
          </button>
        </div>

        {/* Device Snapshot Bar (Industrial Look) */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] flex-shrink-0">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">Equipment</p>
            <p className="text-slate-700 font-black truncate">{Equip.Brand} / {Equip.categoryName}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">Serial Number</p>
            <p className="text-blue-600 font-mono font-bold tracking-widest">{Equip.SerialNumber}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">Laboratory</p>
            <p className="text-slate-700 font-black">{Lab.departmentName}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">In-Charge</p>
            <p className="text-slate-700 font-black">{Lab.encharge}</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-6 flex-grow overflow-hidden flex flex-col bg-white">
          <div className="flex-grow overflow-auto rounded-2xl border border-slate-200 shadow-inner custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-800 text-white text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Ref #</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">
                    {role === "User" && (
                      <button 
                        onClick={() => setFormModalOpen(true)}
                        className="bg-yellow-400 text-blue-900 p-2 rounded-lg hover:scale-110 shadow-sm transition-transform"
                      >
                        <FaPlus size={12} />
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-600">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center"><LoadingTableSpinner /></td></tr>
                ) : request.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-slate-400 uppercase tracking-widest">No Records Found</td></tr>
                ) : (
                  request.map((data) => (
                    <tr key={data._id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                      <td className="p-4 pl-6 font-normal text-slate-400 italic">{formatDateTime(data.DateTime)}</td>
                      <td className="p-4 font-mono text-blue-600">{data.Ref}</td>
                      <td className="p-4">
                        <div className="max-w-[200px] truncate group relative">
                          {data.Description}
                          <FaEdit className="inline ml-2 text-slate-300 hover:text-blue-500 cursor-pointer" />
                        </div>
                      </td>
                      <td className="p-4 text-slate-700">{data.Technician || "---"}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border ${
                          data.Status === 'Success' ? 'bg-green-100/50 text-green-700 border-green-200' : 
                          data.Status === 'Pending' ? 'bg-red-100/50 text-red-700 border-red-200' : 'bg-orange-100/50 text-orange-700 border-orange-200'
                        }`}>
                          {data.Status === 'Success' ? <FaCheckCircle /> : <FaClock />}
                          {data.Status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {role === "Admin" && (
                          <button className="text-slate-300 hover:text-red-500 transition-colors">
                            <FaTrashAlt size={14} />
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
        <div className="bg-yellow-400 py-2 text-center border-t border-yellow-500 flex-shrink-0">
          <p className="text-[8px] font-black text-blue-900 uppercase tracking-[0.5em]">Maintenance Verification System • Lab Official Log</p>
        </div>
      </motion.div>

      {/* Nested Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <AddRequest
            isOpen={isFormModalOpen}
            EquipmentID={Equip._id}
            DepartmentID={Lab.departmentId}
            LaboratoryID={Lab.laboratoryId}
            onClose={() => setFormModalOpen(false)}
            onAddRequest={(newData) => setRequest(prev => [...prev, newData])}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaintenanceModalDisplay;