import React, { useState, useContext,useEffect } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import TechForm from "./TechnicianForm";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { io } from "socket.io-client";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import {
  FaClock,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import socket from "../../../../Back-End/Utils/socket";
function TechnicianTable() {


  const { authToken } = useContext(AuthContext);
  const { request } = useContext(RequestDisplayContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senddata, setsenddata] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLaboratory, setSelectedLaboratory] = useState(""); // ✅ New state for laboratory filter
  const [laboratoryOptions, setLaboratoryOptions] = useState([]); // ✅ Dynamic lab options
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const { setSendPost } = useContext(MessagePOSTcontext);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    // Listen for WebSocket connection
    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket server:", socket.id);
    });

    return () => {
      socket.off("connect"); // Cleanup event listener on unmount
    };
  }, []);
  
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

  // 🔍 Filtering logic
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

  // 📄 Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRequests?.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRequests?.length / rowsPerPage);

  const handleAddRemarks = (remarksData) => {
      setsenddata(remarksData);
      setIsModalOpen(true);
    
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAccomplished = async (datapass) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:3000/api/v1/MaintenanceRequest/${datapass._id}`, // Fixed URL
        { feedbackread: true },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 && response.data.status === "success") {
        toast.success("successfully Send Request!");
        const result = response.data;
        setSendPost({
          ...result,
          message: "I need your Feedback to Accomplished a report.",
          Status: "Accepted",
        });

        socket.emit("newRequest", {
          message: "Message successfully updated!",
          data: response.data.data, // Pass request data
        });
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-neutral-700 p-4 rounded-lg shadow-md">
      {/* 🔍 Search and Filter Section */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        {/* 🔍 Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Ref# or Description..."
            className="block w-64 rounded-lg border dark:border-none dark:bg-neutral-100 py-2 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            onChange={handleSearchChange}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 transform">
            🔍
          </span>
        </div>

        <select
          className="block w-40 rounded-lg border dark:border-none dark:bg-neutral-100 p-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Accomplished">Accomplished</option>
        </select>

        <select
          className="block w-40 rounded-lg border dark:border-none dark:bg-neutral-100 p-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
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

      {/* 🏷 Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs whitespace-nowrap border-collapse">
          <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-200">
            <tr>
              <th className="px-6 py-4">Ref#</th>
              <th className="px-6 py-4">Equipment</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Laboratory</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRows?.map((item, index) => (
              <tr
                key={index}
                className="border-b dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-300"
              >
                <th className="px-6 py-4">{item.Ref}</th>
                <td className="px-6 py-4">{item.price}</td>
                <td className="px-6 py-4">{item.Description}</td>
                <td
                  className={`px-6 py-4 flex items-center gap-2 ${
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

                <td className="px-6 py-4">{item.Department}</td>
                <td className="px-6 py-4">{item.laboratoryName}</td>

                <td className="p-2 text-center text-sm">
                  {item.Status === "Under Maintenance" &&
                    item.remarksread === false &&
                    //yang condition na yan ay kung mahide ang button kung mayloob na ang
                    !item.Remarks && ( 
                      <button
                        onClick={() => handleAddRemarks(item)}
                        className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg px-3 py-2 flex items-center gap-2 transition duration-300"
                      >
                        <i className="fa fa-plus"></i>
                        Add Remarks
                      </button>
                    )}

                  {
                    item.feedbackread === false &&
                    item.remarksread === true && (
                      <button
                        onClick={() => handleAccomplished(item)}
                        className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg px-3 py-2 flex items-center gap-2 transition duration-300"
                      >
                        <i className="fa fa-check"></i>
                        Done
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ToastContainer />
      </div>

      {/* 📄 Pagination Controls */}
      <div className="mt-5 flex items-center justify-between text-sm">
        <p>
          Showing{" "}
          <strong>
            {indexOfFirstRow + 1}-
            {Math.min(indexOfLastRow, filteredRequests?.length)}
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
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-400 text-white hover:bg-gray-500"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            //kung halimbawa equal na ang value sa currentPages at totalPages
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
          />
        )}
      </div>
    </div>
  );
}

export default TechnicianTable;
