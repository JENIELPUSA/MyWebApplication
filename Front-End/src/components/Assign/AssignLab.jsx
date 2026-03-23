import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AssignContext } from "../Context/DisplayAssignContext.jsx";
<<<<<<< HEAD
import { FaSearch, FaChevronLeft, FaChevronRight, FaBuilding, FaFlask } from "react-icons/fa";
import { motion } from "framer-motion";

const AssignLab = () => {
  const { Assignlaboratories, loading, error } = useContext(AssignContext);
  const [uniqueLaboratories, setUniqueLaboratories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    if (Assignlaboratories && Assignlaboratories.length > 0) {
      const processedLabs = Assignlaboratories.reduce((acc, lab) => {
        const existing = acc.find((item) => item.departmentName === lab.departmentName);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ ...lab, count: 1 });
=======
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner.jsx";
const AssignLab = () => {
  const { Assignlaboratories, loading, error } = useContext(AssignContext); // Access data from context
  const [uniqueLaboratories, setUniqueLaboratories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Items per page for pagination
  const navigate = useNavigate();

  // useEffect to process unique laboratories
  useEffect(() => {
    if (Assignlaboratories && Assignlaboratories.length > 0) {
      const processedLabs = Assignlaboratories.reduce((acc, lab) => {
        const existing = acc.find(
          (item) => item.departmentName === lab.departmentName
        );
        if (existing) {
          existing.count += 1; // Increment the count for duplicates
        } else {
          acc.push({
            ...lab, // Include all fields from the lab
            count: 1, // Initialize count
          });
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        }
        return acc;
      }, []);
      setUniqueLaboratories(processedLabs);
    } else {
<<<<<<< HEAD
      setUniqueLaboratories([]);
    }
  }, [Assignlaboratories]);

=======
      setUniqueLaboratories([]); // Reset state if no labs
    }
  }, [Assignlaboratories]);

  // Filter data based on search query
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const filteredLaboratories = uniqueLaboratories?.filter((lab) =>
    lab.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

<<<<<<< HEAD
  const totalPages = Math.ceil(filteredLaboratories.length / itemsPerPage);
  const currentLabs = filteredLaboratories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectDisplay = (selectedLab) => {
    navigate("/LaboratoryAssign", { state: { selectedLab } });
  };

  if (error) return (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 uppercase font-black text-xs tracking-widest">
      System Error: {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      
      {/* Search Section - Terminal Style */}
      <div className="relative max-w-2xl mx-auto">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 mb-2 block">
          Departmental Registry Search
        </label>
        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" />
          <input
            type="text"
            placeholder="FILTER BY DEPARTMENT NAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm tracking-wider transition-all"
          />
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentLabs.length > 0 ? (
          currentLabs.map((lab, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={lab._id}
              className="group relative bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-blue-900/10 hover:border-[#1e3a8a] transition-all"
            >
              {/* Card Header Accent */}
              <div className="h-2 bg-[#1e3a8a] w-full" />
              
              <div className="p-8 flex flex-col items-center">
                {/* Logo/Icon Wrapper */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-yellow-400 group-hover:rotate-6 transition-all duration-500">
                    <img
                      src="/Image/logo.jpg"
                      alt="Lab Logo"
                      className="w-20 h-20 rounded-[1.5rem] object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-[#1e3a8a] p-2 rounded-lg shadow-lg">
                    <FaBuilding size={14} />
                  </div>
                </div>

                <h4 className="text-center text-lg font-black text-[#1e3a8a] uppercase tracking-tighter mb-1 line-clamp-1">
                  {lab.departmentName || "N/A"}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  Terminal Scope: <span className="text-[#1e3a8a]">{lab.count} Units</span>
                </p>

                <button
                  onClick={() => handleSelectDisplay(lab.departmentName)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#1e3a8a] hover:shadow-lg hover:shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Access Facility <FaChevronRight size={10} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <FaFlask className="mx-auto text-slate-200 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching laboratory records found</p>
=======
  // Pagination logic
  const indexOfLastLab = currentPage * itemsPerPage;
  const indexOfFirstLab = indexOfLastLab - itemsPerPage;
  const currentLabs = filteredLaboratories.slice(
    indexOfFirstLab,
    indexOfLastLab
  );
  const totalPages = Math.ceil(filteredLaboratories.length / itemsPerPage);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle selection of a lab and navigate with data
  const handleSelectDisplay = (selectedLab,lab) => {
    console.log("Selected Lab:", selectedLab);
    navigate("/LaboratoryAssign", { state: { selectedLab } }); // Send data to another route
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto xs:px-0 sm:px-8 lg:px-8">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Display filtered laboratories */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xs:gap-2 sm:gap-4 lg:gap-4">
        {currentLabs.length > 0 ? (
          currentLabs.map((lab) => (
            <div
              key={lab._id}
              className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-center items-center transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
            >
              <div className="flex justify-center mb-2">
                <img
                  src="/Image/logo.jpg"
                  alt="Lab Logo"
                  className="w-20 h-20 rounded-full"
                />
              </div>
              <h4 className="mb-2 text-center xs:text-sm sm:text-xl lg:text-xl font-bold text-gray-700 ">
                {lab.departmentName || "N/A"}
              </h4>
              <p className="mb-3 text-center xs:text-xs lg:text-sm sm:text-sm text-gray-700 dark:text-gray-400">
                Number of Laboratories: {lab.count}
              </p>
              <button
                onClick={() => handleSelectDisplay(lab.departmentName,lab)} // Pass selected lab
                className="px-4 xs:py-1 sm:py-2 lg:py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center h-64 flex items-center justify-center">
            <p className="text-gray-700 dark:text-gray-400">
              No data available. Please add new laboratories.
            </p>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Industrial Pagination */}
      {filteredLaboratories.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-[#1e3a8a] disabled:opacity-30 hover:border-yellow-400 transition-all shadow-sm"
          >
            <FaChevronLeft />
          </button>
          
          <div className="px-6 py-2 bg-[#1e3a8a] rounded-full shadow-lg shadow-blue-900/20">
            <span className="text-white font-black text-[10px] uppercase tracking-widest">
              Data Fragment {currentPage} / {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-[#1e3a8a] disabled:opacity-30 hover:border-yellow-400 transition-all shadow-sm"
          >
            <FaChevronRight />
=======
      {/* Pagination controls */}
      {filteredLaboratories.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-l-lg disabled:bg-gray-400"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-r-lg disabled:bg-gray-400"
          >
            Next
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          </button>
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
export default AssignLab;
=======
export default AssignLab;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
