import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {FaPlus} from "react-icons/fa";
import AddFormModal from "./LaboratoryForm"
//Import a context Comming from creating context
import { LaboratoryContext } from '../CountContext';
import {LaboratoryDisplayContext} from '../Context/Laboratory/Display'

const LaboratoryTable = ({
    isOpen, onClose
}) => {
  const {laboratories,
    setLaboratories,
    currentPage,
    laboratoryPerPage,
    setCurrentPage
  } = useContext (LaboratoryDisplayContext)
  
  const { setLaboratoryCount } = useContext(LaboratoryContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const [selectedLab, setSelectedLab] = useState(null); // Initialize as null, not an array
    const [department ,setDepartment] = useState([])
    const [isModalAddForm, setAddFormOpen] = useState(false)

  const handleCloseModal =()=>{
    setAddFormOpen(false)
  }



  const handleDeleteLab = async (laboratoryId) => {
    if (!laboratoryId) {
      toast.error('Laboratory ID is required to delete.');
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:3000/api/v1/laboratory/${laboratoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Laboratory deleted successfully!');
      setLaboratories((prevLabs) =>
        prevLabs.filter((laboratory) => laboratory._id !== laboratoryId)
      );

     
      setLaboratoryCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error deleting laboratory:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete laboratory.';
      toast.error(errorMessage);
    }
  };

  const handleAddLaboratory = (newLaboratory) => {
    setLaboratories((prevLaboratories) => [...prevLaboratories, newLaboratory]);
  };

  const handleUpdateLaboratory = (updateLab) => {
    console.log(updateLab);
    if (!updateLab || !updateLab._id) {
      alert("User ID is missing. Cannot update.");
      return;
    }

    setLaboratories((prevLab) =>
      prevLab.map((laboratory) =>
        laboratory._id === updateLab._id ? updateLab : laboratory
      )
    );

    // Optionally, if you want to fetch the updated users from the server
    // fetchUsers();
  };

  const handleAddClick =()=>{
    setAddFormOpen(true)
  }

  const onLabSelect =(laboratory)=>{
    setAddFormOpen(true)
    setSelectedLab(laboratory)
  }

  const filteredLaboratories = laboratories.filter((lab) =>
    lab.LaboratoryName && lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

    
const totalPages = Math.ceil(filteredLaboratories.length / laboratoryPerPage); // Calculate total pages
    const paginatedLab = filteredLaboratories.slice(
      (currentPage - 1) * laboratoryPerPage,
      currentPage * laboratoryPerPage
    );
    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return; // Check for valid page number
        setCurrentPage(pageNumber); // Update current page
    };
 


    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full text-black shadow-lg relative">
          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
  
          <h2 className="text-xl font-bold mb-4">Laboratory Table</h2>
  
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search Equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
  
          <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="p-4 border-b border-gray-300">Laboratory</th>
                <th className="p-4 border-b border-gray-300">Department</th>
                <th className="p-4 border-b border-gray-300">Encharge</th>
                <th className="p-4 border-b border-gray-300 flex justify-center items-center">
                  <button
                    onClick={() => handleAddClick()}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    <FaPlus className="w-5 h-5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLab.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500"
                  >
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedLab.map((laboratory) => (
                    <tr key={laboratory._id} className="hover:bg-gray-100 transition-colors">
                        <td className="border border-gray-300 p-2">{laboratory.LaboratoryName}</td>
                        <td className="border border-gray-300 p-2">
                            {laboratory.department || 'N/A'}
                        </td>
                        <td className="border border-gray-300 p-2">
                            {laboratory.EnchargeName || 'N/A'}
                        </td>
                        <td className="border border-gray-300 p-2 flex space-x-2 justify-center">
                            <button
                                onClick={() => onLabSelect(laboratory)}
                                className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                            >
                                                                                    <i className="fas fa-edit"></i> {/* Font Awesome edit icon */}
                            </button>
                            <button
                                onClick={() => handleDeleteLab(laboratory._id)}
                                className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                            >
                                 <i className="fas fa-trash-alt"></i> {/* Font Awesome trash icon */}
                            </button>
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
  
     {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="py-2 px-4 bg-gray-200 rounded-full"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`py-2 px-4 rounded-full ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            className="py-2 px-4 bg-gray-200 rounded-full"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
          
          
      {isModalAddForm&&(
            <AddFormModal
            isOpen={isModalAddForm}
            onAddLaboratory={handleAddLaboratory}
            OnEditLaboratory={handleUpdateLaboratory}

            laboratory={selectedLab}
            onClose={handleCloseModal}
            
            />

          )}
        </div>
      </div>
    );
};

export default LaboratoryTable;
