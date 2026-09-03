import React, { useState, useContext, useCallback, useEffect } from "react";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";
import TechForm from "./TechnicianForm";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { MessagePOSTcontext } from "../../contexts/MessageContext/POSTmessage";
import LoadingSpinner from "../ReusableComponent/loadingSpiner";
import {
  FaClock,
  FaCheckCircle,
  FaTools,
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle
} from "react-icons/fa";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

// ✅ HELPER FUNCTION: Safe display of any value
const getDisplayValue = (value) => {
  if (!value) return "N/A";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "object") {
    if (value.DepartmentName) return value.DepartmentName;
    if (value.departmentName) return value.departmentName;
    if (value.name) return value.name;
    if (value.Name) return value.Name;
    if (value.laboratoryName) return value.laboratoryName;
    if (value.LaboratoryName) return value.LaboratoryName;
    if (value.FirstName) {
      return value.LastName ? `${value.FirstName} ${value.LastName}` : value.FirstName;
    }
    if (value.Status) return value.Status;
    if (value.RequestStatus) return value.RequestStatus;
    if (value._id) return value._id;
    return JSON.stringify(value);
  }
  return "N/A";
};

function TechnicianTable() {
  const { authToken } = useContext(AuthContext);
  const { request, loading } = useContext(MaintenanceRequestContext);
  
  let setSendPost = () => {};
  let messageContextError = null;
  
  try {
    const messageContext = useContext(MessagePOSTcontext);
    if (messageContext && typeof messageContext.setSendPost === 'function') {
      setSendPost = messageContext.setSendPost;
    } else {
      messageContextError = "MessagePOSTcontext is not properly configured";
      console.warn("MessagePOSTcontext is undefined or missing setSendPost");
    }
  } catch (error) {
    messageContextError = error.message;
    console.error("Error accessing MessagePOSTcontext:", error);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senddata, setsenddata] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [loadingId, setLoadingId] = useState(null);
  const [clickedRows, setClickedRows] = useState(new Set());
  const [localError, setLocalError] = useState(null);

  // --- FILTER LOGIC ---
  const filteredRequests = (request || []).filter((item) => {
    const ref = getDisplayValue(item.Ref);
    const equipmentName = getDisplayValue(item.EquipmentName);
    const laboratoryName = getDisplayValue(item.laboratoryName);
    
    const matchesSearch = 
      ref.toLowerCase().includes(searchQuery.toLowerCase()) || 
      equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laboratoryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = getDisplayValue(item.Status);
    const matchesStatus = selectedStatus ? status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRequests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // --- ACTIONS ---
  const handleAddRemarks = useCallback((remarksData) => {
    setsenddata(remarksData);
    setIsModalOpen(true);
  }, []);

  const handleAccomplished = useCallback(async (datapass) => {
    if (loadingId) return;
    setLoadingId(datapass._id);
    setLocalError(null);
    
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
        
        if (typeof setSendPost === 'function') {
          setSendPost({
            ...result,
            message: "I need your Feedback to Accomplished a report.",
            Status: "Accepted",
          });
        } else {
          console.warn("setSendPost is not available, skipping context update");
          setLocalError("Context not available, but request was processed.");
        }
        
        // ✅ Inalis ang socket.emit() calls
        
        setClickedRows((prev) => new Set(prev).add(datapass._id));
      }
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      setLocalError(error.response?.data?.message || "Failed to update request. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }, [authToken, setSendPost, loadingId]);

  if (messageContextError) {
    return (
      <div className="bg-red-50 border-2 border-red-400 rounded-xl p-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <h3 className="text-red-700 font-bold text-lg mb-2">Context Error</h3>
        <p className="text-red-600">{messageContextError}</p>
        <p className="text-sm text-gray-600 mt-2">
          Please ensure the component is wrapped with MessagePOSTProvider
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-900 font-sans">
      
      {localError && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span className="font-medium">{localError}</span>
          <button 
            onClick={() => setLocalError(null)}
            className="text-red-700 hover:text-red-900 font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Technician Tasks</h2>
          <div className="h-1.5 w-16 bg-yellow-400 mt-1 rounded-full"></div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Total: {filteredRequests.length} {filteredRequests.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Ref or Equipment..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border-2 border-blue-900 rounded-lg focus:border-yellow-400 outline-none text-sm text-black font-semibold"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
          </div>

          <select
            className="px-4 py-2 bg-blue-900 text-white border-2 border-blue-900 rounded-lg text-sm outline-none focus:border-yellow-400 cursor-pointer font-bold uppercase"
            onChange={(e) => setSelectedStatus(e.target.value)}
            value={selectedStatus}
          >
            <option value="">ALL STATUS</option>
            <option value="Pending">PENDING</option>
            <option value="Under Maintenance">MAINTENANCE</option>
            <option value="Success">SUCCESS</option>
          </select>
        </div>
      </div>

      {/* --- TABLE SECTION - WITHOUT ACTIONS COLUMN --- */}
      <div className="overflow-hidden border-2 border-blue-900 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px]">Ref#</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px]">Equipment Details</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <LoadingTableSpinner />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-400 font-bold uppercase italic">
                    No records found.
                  </td>
                </tr>
              ) : (
                currentRows.map((item) => {
                  const ref = getDisplayValue(item.Ref);
                  const equipmentName = getDisplayValue(item.EquipmentName);
                  const laboratoryName = getDisplayValue(item.laboratoryName);
                  const department = getDisplayValue(item.Department);
                  const status = getDisplayValue(item.Status);
                  
                  return (
                    <tr key={item._id} className="hover:bg-yellow-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-black">{ref}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-black uppercase text-xs tracking-tight">
                            {equipmentName || 'N/A'}
                          </span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase">
                            {laboratoryName || 'N/A'} • {department || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={status} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINATION SECTION --- */}
      {filteredRequests.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-black font-black uppercase tracking-widest">
            Showing {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredRequests.length)} of {filteredRequests.length}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 border-2 border-blue-900 rounded-lg hover:bg-blue-900 hover:text-white text-black disabled:opacity-20 transition-all shadow-sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft size={14} />
            </button>
            
            <div className="bg-blue-900 px-4 py-1.5 rounded-lg border-2 border-blue-900 shadow-md">
              <span className="text-white font-black text-xs uppercase tracking-widest">
                Page {currentPage} / {totalPages || 1}
              </span>
            </div>

            <button
              className="p-2 border-2 border-blue-900 rounded-lg hover:bg-blue-900 hover:text-white text-black disabled:opacity-20 transition-all shadow-sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <TechForm
          isOpen={isModalOpen}
          remarkdata={senddata}
          onClose={() => setIsModalOpen(false)}
          // ✅ Inalis ang socket props
        />
      )}
    </div>
  );
}

// --- BADGE COMPONENT ---
const StatusBadge = ({ status }) => {
  const displayStatus = getDisplayValue(status) || "Pending";
  
  const styles = {
    "Pending": "bg-gray-100 text-black border-gray-300",
    "Under Maintenance": "bg-yellow-100 text-black border-yellow-400",
    "Success": "bg-blue-900 text-white border-blue-900 shadow-md"
  };

  const icons = {
    "Pending": <FaClock />,
    "Under Maintenance": <FaTools />,
    "Success": <FaCheckCircle />
  };

  return (
    <span className={`px-4 py-1.5 rounded-lg border-2 text-[10px] font-black uppercase flex items-center gap-2 tracking-tight ${styles[displayStatus] || styles["Pending"]}`}>
      {icons[displayStatus] || icons["Pending"]} {displayStatus}
    </span>
  );
};

export default TechnicianTable;