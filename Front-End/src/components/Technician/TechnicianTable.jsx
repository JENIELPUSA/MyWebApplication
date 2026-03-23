<<<<<<< HEAD
import React, { useState, useContext, useCallback } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import TechForm from "./TechnicianForm";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
=======
import React, { useState, useContext, useEffect, useCallback } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import TechForm from "./TechnicianForm";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { io } from "socket.io-client";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import socket from "../../socket";
import LoadingSpinner from "../ReusableComponent/loadingSpiner";
import {
  FaClock,
<<<<<<< HEAD
  FaCheckCircle,
  FaTools,
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight
=======
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
} from "react-icons/fa";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

function TechnicianTable() {
<<<<<<< HEAD
  const { authToken } = useContext(AuthContext);
  const { request, loading } = useContext(RequestDisplayContext);
  const { setSendPost } = useContext(MessagePOSTcontext);

=======
  const [loadings, setLoading] = useState(false);
  const { authToken ,fullName,userId} = useContext(AuthContext);
  const { request, loading,setRequest } = useContext(RequestDisplayContext);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senddata, setsenddata] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
<<<<<<< HEAD
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
=======
  const [selectedLaboratory, setSelectedLaboratory] = useState("");
  const [laboratoryOptions, setLaboratoryOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const [loadingId, setLoadingId] = useState(null);
  const [clickedRows, setClickedRows] = useState(new Set());
  const { setSendPost } = useContext(MessagePOSTcontext);
  const [newdata,setnewData]=useState([])
  


useEffect(() => {
  if (Array.isArray(request) && fullName) {
    const filtered = request.filter((item) => {
      const techName = typeof item.Technician === "string" ? item.Technician.trim().toLowerCase() : "";
      const targetName = fullName.trim().toLowerCase();
      return item.UserId && techName === targetName;
    });

    setnewData(filtered);
    console.log("Filtered Requests (case-insensitive):", filtered);
  } else {
    console.log("NO Match");
  }
}, [request, fullName]);

  



  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Extract matching laboratories dynamically based on Ref match
    const matchingLabs = newdata
      .filter((item) => item.Ref?.toLowerCase().includes(query))
      .map((item) => item.laboratoryName);

    // Remove duplicates
    setLaboratoryOptions([...new Set(matchingLabs)]);
  };


  const filteredRequests = newdata.filter((item) => {
    const refMatch = item.Ref?.toLowerCase().includes(searchQuery);
    const labMatch = item.laboratoryName?.toLowerCase().includes(searchQuery);
    const matchesSearch = refMatch || labMatch;

    const matchesStatus = selectedStatus ? item.Status === selectedStatus : true;
    const matchesLaboratory = selectedLaboratory ? item.laboratoryName === selectedLaboratory : true;

    const hasTechnician =
      (Array.isArray(item.Technician) && item.Technician.length > 0) ||
      (typeof item.Technician === 'string' && item.Technician.trim() !== "" && item.Technician !== "N/A");

    return matchesSearch && matchesStatus && matchesLaboratory && hasTechnician;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRequests?.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRequests?.length / rowsPerPage);

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const handleAddRemarks = useCallback((remarksData) => {
    setsenddata(remarksData);
    setIsModalOpen(true);
  }, []);

<<<<<<< HEAD
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
=======
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

    const handleAddNewData = (newEquip) => {
      toast.success("Remarks assigned successfully");
       socket.emit("RequestMaintenance",newEquip)
    };

  const handleAccomplished = useCallback(
    async (datapass) => {
      if (loadingId) return; // Prevent another button from loading if one is already in progress
      setLoadingId(datapass._id);
      try {
        const response = await axios.patch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/v1/MaintenanceRequest/${datapass._id}`,
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

          socket.emit("newRequest", {
            message: "Message successfully updated!",
            data: result.data,
          });

          socket.emit("RequestMaintenance",(result))

          setClickedRows((prev) => new Set(prev).add(datapass._id));
        }
      } catch (error) {
        console.error("Error updating message:", error);
        toast.error(
          error.response?.data?.message || "An unexpected error occurred."
        );
      } finally {
        setLoadingId(null);
      }
    },
    [authToken, socket, loadingId]
  ); //  Include dependencies

  return (
    <div className="overflow-x-auto bg-white dark:bg-neutral-700 p-4 rounded-lg shadow-md">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-between items-center mb-4">
        {/* 🔍 Search Bar */}
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Ref# or Description..."
            className="block w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg border dark:border-none dark:bg-neutral-100 py-2 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            onChange={handleSearchChange}
          />
        </div>

        {/*Filter Dropdowns */}
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            className="w-full sm:w-40 rounded-lg border dark:border-none dark:bg-neutral-100 p-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Success">Accomplished</option>
          </select>

          {/* Laboratory Filter */}
          <select
            className="w-full sm:w-40 rounded-lg border dark:border-none dark:bg-neutral-100 p-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            onChange={(e) => setSelectedLaboratory(e.target.value)}
          >
            <option value="">All Laboratories</option>
            {laboratoryOptions.map((lab, index) => (
              <option key={index} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full overflow-x-auto rounded-lg">
        <table className="xs:text-xs min-w-[700px] w-full text-left whitespace-nowrap border-collapse text-sm sm:text-base">
          <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-200">
            <tr>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Ref#</th>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Equipment</th>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Description</th>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Status</th>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Department</th>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Laboratory</th>
              <th className="xs:text-xs px-4 sm:px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  <LoadingTableSpinner />
                </td>
              </tr>
            ) : currentRows?.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border p-4 text-center text-gray-500"
                >
                  No Result Found
                </td>
              </tr>
            ) : (
              currentRows.filter((item) => Array.isArray(item.Technician) ? item.Technician.length > 0 : !!item.Technician).map((item, index) => (
                <tr
                  key={index}
                  className="border-b dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-300"
                >
                  <td className="px-4 sm:px-6 py-3 font-medium">{item.Ref}</td>
                  <td className="px-4 sm:px-6 py-3">
                    {item.EquipmentName} / {item.CategoryName}
                  </td>
                  <td className="px-4 sm:px-6 py-3">{item.Description}</td>
                  <td
                    className={`px-4 sm:px-6 py-3 flex items-center gap-2 ${
                      item.Status === "Pending"
                        ? "text-red-300"
                        : item.Status === "Assigned"
                        ? "text-orange-300"
                        : item.Status === "Success"
                        ? "text-green-500"
                        : item.Status === "Under Maintenance"
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {item.Status === "Pending" && (
                      <FaClock className="text-red-500" />
                    )}
                    {item.Status === "Assigned" && (
                      <FaUserCheck className="text-orange-300" />
                    )}
                    {item.Status === "Success" && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                    {item.Status === "Under Maintenance" && (
                      <FaTimesCircle className="text-red-600" />
                    )}
                    {item.Status !== "Pending" &&
                      item.Status !== "Assigned" &&
                      item.Status !== "Under Maintenance" &&
                      item.Status !== "Success" && (
                        <FaTimesCircle className="text-gray-700" />
                      )}
                    {item.Status}
                  </td>
                  <td className="px-4 sm:px-6 py-3">{item.Department}</td>
                  <td className="px-4 sm:px-6 py-3">{item.laboratoryName}</td>
                  <td className="px-4 sm:px-6 py-3 text-center">
                    {item.Status === "Under Maintenance" &&
                      item.remarksread === false &&
                      !item.Remarks && (
                        <button
                          onClick={() => handleAddRemarks(item)}
                          className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg px-3 py-2 flex items-center gap-2 transition duration-300"
                        >
                          <i className="fa fa-plus"></i> Add Remarks
                        </button>
                      )}
                    {item.feedbackread === false &&
                      item.remarksread === true && (
                        <button
                          onClick={() => handleAccomplished(item)}
                          className={`px-4 py-2 bg-green-500 text-white rounded-md ${
                            clickedRows.has(item._id)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            clickedRows.has(item._id) || loadingId === item._id
                          } 
                        >
                          {loadingId === item._id ? <LoadingSpinner /> : "Done"}
                        </button>
                      )}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

<<<<<<< HEAD
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
=======
      <div className="mt-5 flex items-center justify-between text-sm flex-wrap gap-3">
  <div className="flex items-center space-x-2">
    {/* Previous Button */}
    <button
      className="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Previous
    </button>

    {/* Page Number Display */}
    <p className="text-sm">
      Page {currentPage} of {totalPages}
    </p>

    {/* Next Button */}
    <button
      className="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>

  {isModalOpen && (
    <TechForm
      isOpen={isModalOpen}
      remarkdata={senddata}
      onClose={handleCloseModal}
      socket={socket}
      acceptNewDtaa={handleAddNewData}
    />
  )}
</div>

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </div>
  );
}

<<<<<<< HEAD
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
=======
export default TechnicianTable;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
