import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddRequest from "./AddRequest";
import { AuthContext } from "../Context/AuthContext";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
=======
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import {
  FaClock,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
<<<<<<< HEAD
  FaTools,
  FaTimes,
  FaPlus,
  FaTrashAlt,
  FaEdit
=======
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
} from "react-icons/fa";

const MaintenanceModalDisplay = ({ Lab, Equip, onClose }) => {
  const [animateExit, setAnimateExit] = useState(false);
<<<<<<< HEAD
  const { authToken, role } = useContext(AuthContext);
  const { fetchRequestData } = useContext(RequestDisplayContext);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;
    fetchRequest();
  }, [authToken]);
=======
  const [isVisible, setIsVisible] = useState(false);
  const { authToken, role } = useContext(AuthContext);
  const { fetchRequestData } = useContext(RequestDisplayContext);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isEquipId, setEquipId] = useState(null);
  const [isDepartID, setDaprtID] = useState(null);
  const [isLabID, setLabID] = useState(null);
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  //format para ma convert ang time at Date.
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long", // Full month name
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // AM/PM format
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  const handleAddClick = (Equipment, Department, Laboratory) => {
    setEquipId(Equipment);
    setDaprtID(Department);
    setLabID(Laboratory);
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setIsVisible(false);
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 70); // Trigger animation
    if (!authToken) {
      console.warn("No token found in localStorage");
      setError("Authentication token is missing. Please log in.");
      setLoading(false); // Stop loading when there is no token
      return;
    }else if(request){
      fetchRequestData();
    }

    fetchRequest();
    fetchRequestData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest?Equipments=${Equip._id}`,
<<<<<<< HEAD
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setRequest(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
=======
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setRequest(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const handleAddRequest = (neAddRequest) => {
    if (!neAddRequest || !neAddRequest._id) {
      alert("Department ID is Missing!!");
      return;
    }

    setRequest((prevRequest) => [...prevRequest, neAddRequest]);
  };

  const handleDeleteSpecificData = async (SpecifDataID) => {
    if (!SpecifDataID) {
      toast.error("Equipment ID is required to delete.");
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${SpecifDataID._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setRequest((prevRequest) =>
        prevRequest.filter((equipment) => equipment._id !== SpecifDataID._id)
      );
      toast.success("Request deleted successfully!");
      fetchRequestData();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment.");
    }
  };
 

  return (
    <motion.div
       className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 xs:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          div className="bg-white rounded-lg p-6 max-w-4xl w-full text-black shadow-lg relative"
          initial={{ opacity: 0, y: -50 }}
          animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Close Icon */}
          <motion.button
            className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
            whileTap={{ scale: 0.8 }} // Shrinks on click
            whileHover={{ scale: 1.1 }} // Enlarges on hover
            transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
            onClick={() => {
              setAnimateExit(true); // Set the animation state to trigger upward motion
              setTimeout(onClose, 500); // Close after 500ms to match the animation duration
            }}
          >
            <i className="fas fa-times"></i>
          </motion.button>
      {/* Modal Header */}
      <h2 className="xs:text-lg sm:text-lg lg:text-xl font-semibold text-gray-700 mb-4">
        Maintenance Request Records
      </h2>
  
      {/* Equipment Info Table */}
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 text-sm">
              <span className="xs:text-xs sm:text-sm lg:text-sm font-bold">Equipment</span>
            </td>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              {Equip.Brand} / {Equip.categoryName}
            </td>
          </tr>
          <tr>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              <span className="font-bold">S/N</span>
            </td>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              {Equip.SerialNumber}
            </td>
          </tr>
          <tr>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              <span className="font-bold">Laboratory Room</span>
            </td>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              {Lab.departmentName}
            </td>
          </tr>
          <tr>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              <span className="font-bold">In-charge</span>
            </td>
            <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
              {Lab.encharge}
            </td>
          </tr>
        </tbody>
      </table>
  
      {/* Divider Line */}
      <div className="border-t border-gray-300 my-4"></div>
 {/* Purpose nito para malagyan ng scroll bar sa baba */}
      <div className="overflow-x-auto">
        
      {/* Requests Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Date & Time</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Ref #</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Description</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Technician</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Remarks</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Status</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-left text-sm">Feedback</th>
            <th className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-center text-sm">
              {role === "User" ? (
                <button
                  onClick={() =>
                    handleAddClick(
                      Equip._id,
                      Lab.departmentId,
                      Lab.laboratoryId
                    )
                  }
                  className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  <i className="fas fa-plus text-lg"></i> {/* FontAwesome plus icon */}
                </button>
              ) : null}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8}>
                <LoadingTableSpinner />
              </td>
            </tr>
          ) : request.length === 0 ? (
            <tr>
              <td colSpan={8} className="border border-gray-300 p-4 text-center text-sm">
                No Results Found
              </td>
            </tr>
          ) : (
            request.map((requestData) => (
              <tr key={requestData._id} className="hover:bg-gray-100">
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">{formatDateTime(requestData.DateTime)}</td>
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">{requestData.Ref}</td>
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">
                  <div className="grid justify-center">
                    {requestData.Description}
                    <button className="xs:text-xs sm:text-sm lg:text-sm text-blue-500 text-sm ml-2">Edit</button>
                  </div>
                </td>
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">{requestData.Technician}</td>
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">{requestData.remarksread ? requestData.Remarks : null}</td>
                <td
                  className={`xs:text-xs sm:text-sm lg:text-sm px-6 py-4 flex items-center gap-2 ${
                    requestData.Status === "Pending"
                      ? "text-red-500"
                      : requestData.Status === "Assigned"
                      ? "text-orange-300"
                      : requestData.Status === "Success"
                      ? "text-green-500"
                      : "text-gray-700"
                  }`}
                >
                  {requestData.Status === "Pending" && <FaClock className="xs:text-xs sm:text-sm lg:text-sm text-red-500" />}
                  {requestData.Status === "Assigned" && <FaUserCheck className="xs:text-xs sm:text-sm lg:text-sm text-orange-300" />}
                  {requestData.Status === "Success" && <FaCheckCircle className="xs:text-xs sm:text-sm lg:text-sm text-green-500" />}
                  {requestData.Status !== "Pending" &&
                    requestData.Status !== "Assigned" &&
                    requestData.Status !== "Success" && <FaTimesCircle className="xs:text-xs sm:text-sm lg:text-sm text-gray-700" />}
                  {requestData.Status}
                </td>
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-sm">{requestData.feedback}</td>
                <td className="xs:text-xs sm:text-sm lg:text-sm border border-gray-300 p-2 text-center text-sm">
                  {role === "Admin" && (
                    <button onClick={() => handleDeleteSpecificData(requestData)} className="xs:text-xs sm:text-sm lg:text-sm text-red-500 mx-1">
                      DELETE
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      </div>
  
    </motion.div>
  
    {isFormModalOpen && (
      <AddRequest
        isOpen={isFormModalOpen}
        EquipmentID={isEquipId}
        DepartmentID={isDepartID}
        LaboratoryID={isLabID}
        onClose={handleCloseModal}
        onAddRequest={handleAddRequest}
      />
    )}
  </motion.div>
  
  );
};

export default MaintenanceModalDisplay;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
