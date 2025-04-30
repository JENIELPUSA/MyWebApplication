import React, { useState, useContext, useEffect, useCallback } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import TechForm from "./TechnicianForm";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { io } from "socket.io-client";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
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
  const { authToken } = useContext(AuthContext);
  const { request, loading } = useContext(RequestDisplayContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senddata, setsenddata] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLaboratory, setSelectedLaboratory] = useState(""); 
  const [laboratoryOptions, setLaboratoryOptions] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const { setSendPost } = useContext(MessagePOSTcontext);
    const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL, {
    withCredentials: true,
    transports: ['websocket'], // optional pero maganda para mas mabilis
  }); 
  useEffect(() => {
    socket.on("adminNotification");
    socket.on("SMSNotification");

    return () => {
      socket.off("adminNotification");
      socket.off("SMSNotification");
    };
  }, [socket]);
  // Mag uupdate ang dropdown kapag may seacrhQuery na nalagay
  //dito ipinapasa ang reference na na input sa search
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Extract matching laboratories dynamically
    const matchingLabs = request
      .filter((item) => item.Ref.toLowerCase().includes(query))

      //pagkatpos mahanap ang data ay
      //kinukuha lang natin ang laboratoryName ng bawat tumutugmang item.
      .map((item) => item.laboratoryName);

    // Remove duplicates
    //para hindi mag ulit2 ang pag print ng mga laboratory name sa dropdown
    setLaboratoryOptions([...new Set(matchingLabs)]);
  };

  //  Filtering logic
  const filteredRequests = request?.filter((item) => {
    const matchesSearch =
      item.Ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.laboratoryName.toLowerCase().includes(searchQuery.toLowerCase());

    //filtering specific data or hinahanap ang data batay sa na select sa dropdown
    //tinatawag ito na ternary Operator
    const matchesStatus = selectedStatus
      ? item.Status === selectedStatus
      : true;

    const matchesLaboratory = selectedLaboratory
      ? item.laboratoryName === selectedLaboratory
      : true;

    return matchesSearch && matchesStatus && matchesLaboratory;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRequests?.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRequests?.length / rowsPerPage);

  const handleAddRemarks = useCallback((remarksData) => {
    setsenddata(remarksData);
    setIsModalOpen(true);
  },[]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAccomplished = useCallback(async (datapass) => {
    setLoading(true);
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
  
        socket.emit("newRequest", {
          message: "Message successfully updated!",
          data: result.data,
        });
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [authToken, socket]); // ✅ Include dependencies
  

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
            ) : currentRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border p-4 text-center text-gray-500"
                >
                  No Result Found
                </td>
              </tr>
            ) : (
              currentRows.map((item, index) => (
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
                          className="mt-3 flex items-center justify-center rounded-full w-full bg-green-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:bg-green-600 focus:outline-none h-10"
                        >
                          {loadings ? <LoadingSpinner /> : "Done"}
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
  <p>
    Showing{" "}
    <strong>
      {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredRequests?.length)}
    </strong>{" "}
    of <strong>{filteredRequests?.length}</strong>
  </p>

  <div className="flex space-x-2">
    <button
      className="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Previous
    </button>

    {/* Page number buttons hidden */}

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
    socket={socket} //
  />
  )}
</div>

    </div>
  );
}

export default TechnicianTable;