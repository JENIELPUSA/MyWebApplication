import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AssignContext } from "../../contexts/AssignLabContext/AssignLabContext";
import { FaSearch, FaChevronLeft, FaChevronRight, FaBuilding, FaFlask } from "react-icons/fa";
import { motion } from "framer-motion";
import logo from "../../../public/logo.jpg"; // Imported logo

const AssignLab = () => {
  // Add null check for context
  const context = useContext(AssignContext);
  
  // If context is undefined, show error
  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="max-w-md w-full bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-6 text-blue-900 shadow-sm">
          <h3 className="font-bold text-base mb-1">Context Error</h3>
          <p className="text-xs text-blue-800">AssignContext is not available. Make sure AssignLabProvider is wrapping this component.</p>
        </div>
      </div>
    );
  }

  const { Assignlaboratories, loading, error } = context;
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
        }
        return acc;
      }, []);
      setUniqueLaboratories(processedLabs);
    } else {
      setUniqueLaboratories([]);
    }
  }, [Assignlaboratories]);

  const filteredLaboratories = uniqueLaboratories?.filter((lab) =>
    lab.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLaboratories?.length / itemsPerPage) || 1;
  const currentLabs = filteredLaboratories?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  const handleSelectDisplay = (selectedLab) => {
    navigate("/dashboard/LaboratoryAssign", { state: { selectedLab } });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-yellow-400 mx-auto"></div>
          <p className="text-blue-900 font-semibold text-xs tracking-wider uppercase">Loading Laboratories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-2xl text-blue-900 font-medium text-xs tracking-wide shadow-sm">
        System Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search Section (White, Blue & Yellow Theme) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-lg shadow-blue-900/5 relative overflow-hidden">
        {/* Subtle Yellow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-yellow-400 to-blue-600" />

        <div>
          <h1 className="text-xl font-black text-blue-950 tracking-tight">Assigned Laboratories</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Select a department facility to manage registry settings and units.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-sm" />
          <input
            type="text"
            placeholder="Search department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-blue-950 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentLabs.length > 0 ? (
          currentLabs.map((lab, index) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              key={lab._id || index}
              className="group bg-white border-2 border-blue-100/80 rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-yellow-400 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Card Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 group-hover:bg-yellow-400 transition-colors" />

              <div>
                {/* Card Top: Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border-2 border-blue-200 overflow-hidden shadow-sm group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                      <img
                        src={logo}
                        alt="Lab Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-yellow-50 text-blue-950 border border-yellow-200 shadow-sm">
                    <FaBuilding className="text-yellow-600" size={10} />
                    {lab.count || 0} Units
                  </span>
                </div>

                {/* Department Name */}
                <h4 className="text-base font-black text-blue-950 tracking-tight line-clamp-1 mb-1">
                  {lab.departmentName || "N/A"}
                </h4>
                <p className="text-xs text-slate-400 font-semibold mb-6">
                  Active Department Facility
                </p>
              </div>

              {/* Action Button (Blue with Yellow Accent on Hover) */}
              <button
                onClick={() => handleSelectDisplay(lab.departmentName)}
                className="w-full py-2.5 bg-blue-600 hover:bg-yellow-400 text-white hover:text-blue-950 rounded-2xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                Access Facility <FaChevronRight size={10} />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white border-2 border-dashed border-blue-100 rounded-3xl shadow-sm">
            <FaFlask className="mx-auto text-blue-300 mb-3" size={32} />
            <p className="text-blue-900 font-bold text-xs uppercase tracking-wide">No matching laboratory records found</p>
          </div>
        )}
      </div>

      {/* Modern Pagination */}
      {filteredLaboratories && filteredLaboratories.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 bg-white border-2 border-blue-100 rounded-2xl text-blue-900 disabled:opacity-30 hover:border-yellow-400 hover:bg-yellow-50/50 transition-all shadow-sm"
          >
            <FaChevronLeft size={12} />
          </button>
          
          <div className="px-5 py-2.5 bg-blue-600 rounded-2xl shadow-md shadow-blue-900/10">
            <span className="text-white font-black text-xs uppercase tracking-wider">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-white border-2 border-blue-100 rounded-2xl text-blue-900 disabled:opacity-30 hover:border-yellow-400 hover:bg-yellow-50/50 transition-all shadow-sm"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignLab;