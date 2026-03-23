import React, { useState, useContext, useCallback } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import TechForm from "./TechnicianForm";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import socket from "../../socket";
import LoadingSpinner from "../ReusableComponent/loadingSpiner";
import {
  FaClock,
  FaCheckCircle,
  FaTools,
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

function TechnicianTable() {
  const { authToken } = useContext(AuthContext);
  const { request, loading } = useContext(RequestDisplayContext);
  const { setSendPost } = useContext(MessagePOSTcontext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senddata, setsenddata] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [loadingId, setLoadingId] = useState(null);
  const [clickedRows, setClickedRows] = useState(new Set());

  // --- FILTER LOGIC ---
  const filteredRequests = (request || []).filter((item) => {
    const matchesSearch = 
      item.Ref?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.EquipmentName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus ? item.Status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRequests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  // --- ACTIONS ---
  const handleAddRemarks = useCallback((remarksData) => {
    setsenddata(remarksData);
    setIsModalOpen(true);
  }, []);

  const handleAccomplished = useCallback(async (datapass) => {
    if (loadingId) return;
    setLoadingId(datapass._id);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${datapass._id}`,
        { feedbackread: true },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.status === 200 && response.data.status === "success") {
        const result = response.data;
        setSendPost({
          ...result,
          message: "I need your Feedback to Accomplished a report.",
          Status: "Accepted",
        });
        socket.emit("newRequest", { message: "Updated!", data: result.data });
        socket.emit("RequestMaintenance", result);
        setClickedRows((prev) => new Set(prev).add(datapass._id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  }, [authToken, setSendPost, loadingId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-900 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Technician Tasks</h2>
          <div className="h-1.5 w-16 bg-yellow-400 mt-1 rounded-full"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search Task..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border-2 border-blue-900 rounded-lg focus:border-yellow-400 outline-none text-sm text-black font-semibold"
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select
            className="px-4 py-2 bg-blue-900 text-white border-2 border-blue-900 rounded-lg text-sm outline-none focus:border-yellow-400 cursor-pointer font-bold uppercase"
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="">ALL STATUS</option>
            <option value="Pending">PENDING</option>
            <option value="Under Maintenance">MAINTENANCE</option>
            <option value="Success">SUCCESS</option>
          </select>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="overflow-hidden border-2 border-blue-900 rounded-xl">
        <table className="w-full text-left text-sm border-collapse">
          {/* Blue Background -> White Text */}
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px]">Ref#</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px]">Equipment Details</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px] text-center">Status</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><LoadingTableSpinner /></td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase italic">No records found.</td></tr>
            ) : (
              currentRows.map((item) => (
                <tr key={item._id} className="hover:bg-yellow-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-black">{item.Ref}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-black uppercase text-xs tracking-tight">{item.EquipmentName}</span>
                      <span className="text-[10px] text-gray-600 font-bold uppercase">{item.laboratoryName} • {item.Department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <StatusBadge status={item.Status} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {/* Yellow Background -> Black Text */}
                      {item.Status === "Under Maintenance" && !item.remarksread && !item.Remarks && (
                        <button
                          onClick={() => handleAddRemarks(item)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-[11px] font-black uppercase rounded-lg shadow-sm transition-all active:scale-95 border border-black/10"
                        >
                          <FaPlus size={10} /> Remarks
                        </button>
                      )}
                      {/* Blue Background -> White Text */}
                      {item.remarksread && !item.feedbackread && (
                        <button
                          onClick={() => handleAccomplished(item)}
                          disabled={clickedRows.has(item._id) || loadingId === item._id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white text-[11px] font-black uppercase rounded-lg shadow-md transition-all active:scale-95"
                        >
                          {loadingId === item._id ? <LoadingSpinner /> : "Execute Done"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION SECTION --- */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-black font-black uppercase tracking-widest">Total: {filteredRequests.length}</p>
        
        <div className="flex items-center gap-2">
          <button
            className="p-2 border-2 border-blue-900 rounded-lg hover:bg-blue-900 hover:text-white text-black disabled:opacity-20 transition-all shadow-sm"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          ><FaChevronLeft size={14} /></button>
          
          {/* Blue Background -> White Text */}
          <div className="bg-blue-900 px-4 py-1.5 rounded-lg border-2 border-blue-900 shadow-md">
             <span className="text-white font-black text-xs uppercase tracking-widest">Page {currentPage} / {totalPages || 1}</span>
          </div>

          <button
            className="p-2 border-2 border-blue-900 rounded-lg hover:bg-blue-900 hover:text-white text-black disabled:opacity-20 transition-all shadow-sm"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          ><FaChevronRight size={14} /></button>
        </div>
      </div>

      {isModalOpen && (
        <TechForm
          isOpen={isModalOpen}
          remarkdata={senddata}
          onClose={() => setIsModalOpen(false)}
          socket={socket}
          acceptNewDtaa={(data) => socket.emit("RequestMaintenance", data)}
        />
      )}
    </div>
  );
}

// --- BADGE COMPONENT ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Pending": "bg-gray-100 text-black border-gray-300",
    "Under Maintenance": "bg-yellow-100 text-black border-yellow-400",
    // Blue Background -> White Text
    "Success": "bg-blue-900 text-white border-blue-900 shadow-md"
  };

  const icons = {
    "Pending": <FaClock />,
    "Under Maintenance": <FaTools />,
    "Success": <FaCheckCircle />
  };

  return (
    <span className={`px-4 py-1.5 rounded-lg border-2 text-[10px] font-black uppercase flex items-center gap-2 tracking-tight ${styles[status] || styles["Pending"]}`}>
      {icons[status]} {status}
    </span>
  );
};

export default TechnicianTable;
