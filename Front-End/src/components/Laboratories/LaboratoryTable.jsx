import React, { useState, useContext } from "react";
import { LaboratoryContext } from "../../contexts/LaboratoryContext/LaboratoryContext";
import { 
  FaPlus, FaEdit, FaTrashAlt, FaSearch, 
  FaChevronLeft, FaChevronRight, FaFlask,
  FaMicroscope
} from "react-icons/fa";
import AddFormModal from "./LaboratoryForm";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

const LaboratoryTable = () => {
  const {
    laboratories,
    setLaboratories,
    currentPage,
    laboratoryPerPage,
    setCurrentPage,
    DeleteLaboratory,
    loading
  } = useContext(LaboratoryContext);

  const { setLaboratoryCount } = useContext(LaboratoryContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLab, setSelectedLab] = useState(null);
  const [isModalAddForm, setAddFormOpen] = useState(false);

  // --- LOGIC: FILTER & PAGINATION ---
  const filteredLaboratories = laboratories?.filter(
    (lab) =>
      lab.LaboratoryName &&
      lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredLaboratories.length / laboratoryPerPage);
  const paginatedLab = filteredLaboratories.slice(
    (currentPage - 1) * laboratoryPerPage,
    currentPage * laboratoryPerPage
  );
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  // --- HANDLERS ---
  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedLab(null);
  };

  const handleAddClick = () => {
    setSelectedLab(null);
    setAddFormOpen(true);
  };

  const onLabSelect = (laboratory) => {
    setSelectedLab(laboratory);
    setAddFormOpen(true);
  };

  const handleDeleteLab = async (id) => {
    if (window.confirm("Delete this laboratory?")) {
      const result = await DeleteLaboratory(id);
      if (result.success) {
        setLaboratories((prev) => prev.filter((lab) => lab._id !== id));
        setLaboratoryCount((prev) => prev - 1);
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FaFlask size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Laboratory Management</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monitor and organize lab facilities</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Total Laboratories: <span className="font-bold text-blue-600 dark:text-blue-400">{laboratories?.length || 0}</span>
        </div>
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="p-4 flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search laboratory name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm whitespace-nowrap"
        >
          <FaPlus size={12} /> <span>Add Laboratory</span>
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <FaMicroscope size={12} />
                  Lab Name
                </div>
              </th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">In-charge</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                    <span>Loading laboratories...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedLab.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  {searchTerm ? 'No matching laboratories found.' : 'No laboratories found. Click "Add Laboratory" to get started.'}
                </td>
              </tr>
            ) : (
              paginatedLab.map((lab) => (
                <tr key={lab._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        {lab.LaboratoryName?.charAt(0).toUpperCase() || 'L'}
                      </div>
                      <span>{lab.LaboratoryName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                      {lab.department || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {lab.EnchargeName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => onLabSelect(lab)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Edit Laboratory"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteLab(lab._id)}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete Laboratory"
                      >
                        <FaTrashAlt size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">
            {filteredLaboratories.length === 0 ? 0 : Math.min(filteredLaboratories.length, (currentPage - 1) * laboratoryPerPage + 1)}
          </span> to{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(currentPage * laboratoryPerPage, filteredLaboratories.length)}
          </span> of{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{filteredLaboratories.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || filteredLaboratories.length === 0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaChevronLeft size={10} />
          </button>
          
          {/* Page Numbers with Ellipsis */}
          <div className="flex gap-0.5">
            {getPageNumbers().map((num, i) => (
              <button
                key={i}
                onClick={() => typeof num === "number" && paginate(num)}
                disabled={num === "..."}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  currentPage === num
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : num === "..." 
                    ? "cursor-default text-gray-300 dark:text-gray-600" 
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || filteredLaboratories.length === 0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* FORM MODAL - Still a modal for adding/editing laboratory */}
      {isModalAddForm && (
        <AddFormModal
          isOpen={isModalAddForm}
          onAddLaboratory={(newLab) => {
            setLaboratories(prev => [...prev, newLab]);
            handleCloseModal();
          }}
          OnEditLaboratory={(updated) => {
            setLaboratories(prev => prev.map(l => l._id === updated._id ? updated : l));
            handleCloseModal();
          }}
          laboratory={selectedLab}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default LaboratoryTable;