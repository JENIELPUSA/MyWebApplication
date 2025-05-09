import React, { useState, useContext, useEffect, useCallback } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import TechForm from "./TechnicianForm";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { io } from "socket.io-client";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import socket from "../../socket";
import LoadingSpinner from "../ReusableComponent/loadingSpiner";
import {
  FaClock,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

function TechnicianTable() {
  const [loadings, setLoading] = useState(false);
  const { authToken ,fullName,userId} = useContext(AuthContext);
  const { request, loading,setRequest } = useContext(RequestDisplayContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senddata, setsenddata] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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

  const handleAddRemarks = useCallback((remarksData) => {
    setsenddata(remarksData);
    setIsModalOpen(true);
  }, []);

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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

    </div>
  );
}

export default TechnicianTable;
