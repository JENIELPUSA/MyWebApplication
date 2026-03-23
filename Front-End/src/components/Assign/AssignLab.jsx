import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AssignContext } from "../Context/DisplayAssignContext.jsx";
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
          </div>
        )}
      </div>

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
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignLab;