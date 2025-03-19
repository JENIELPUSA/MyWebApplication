import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {FaPlus} from "react-icons/fa";

import DepartmentFormModal from './DepartmentForm'

import {DepartmentDisplayContext} from '../Context/Department/Display'

const DepartmentTables = ({isOpen, onClose}) =>{
  const {department,setDepartment,departmentPerPage,currentPage, setCurrentPage}=useContext(DepartmentDisplayContext)

    
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
    const [totalDepartment, setTotalDepartments] = useState(0); // Total count of departments
    const token = localStorage.getItem('token'); // Token for API authentication
    const [selectedDepartment,setSelectedDepartment]=useState(null)
    const [isAddFormOpen , setAddFormOpen]= useState(false)
  

 
 
    const handleAddClick =()=>{
        setAddFormOpen(true);
        
    }
    const handleCloseModal =()=>{
      setAddFormOpen(false);
    }

    const filterDepartment = department.filter((department) =>
      department.DepartmentName &&
      department.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );


      const totalPages = Math.ceil(filterDepartment.length / departmentPerPage);

      const paginatedDepartment = filterDepartment.slice(
        (currentPage - 1) * departmentPerPage,
        currentPage * departmentPerPage
      );

      const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
          setCurrentPage(pageNumber);
        }
      };

      if (!isOpen) return null;

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(
                `http://127.0.0.1:3000/api/v1/departments?page=${currentPage}&limit=${departmentPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDepartment(res.data.data); // Set the department data
            setTotalDepartments(res.data.total); // Set the total count
        } catch (error) {
            console.error('Error fetching data:', error.response ? error.response.data : error.message);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    
    const handleUpdateDepartment =(updateDepartment)=>{
        
        if (!updateDepartment || !updateDepartment._id) {
            alert("User ID is missing. Cannot update.");
            return;
        }
    
        setDepartment((prevDepartment) =>
            prevDepartment.map((department) => (department._id === updateDepartment._id ? updateDepartment : department))
        );

        
      }


      const handdleDepartmentSelect =(department)=>{
      
        setAddFormOpen(true);
        setSelectedDepartment(department); // Set the selected equipment
          
      };
      


    const handdleDelete =async (departmentId)=>{
        try{
            await axios.delete(`http://127.0.0.1:3000/api/v1/departments/${departmentId}`,{
                headers: {Authorization:`Bearer ${token}`},
            })

            setDepartment((prevDepartment) => prevDepartment.filter((depart) => depart._id !== departmentId));
            toast.success('Department deleted successfully!');
                

        }catch(error){
            console.error('Error deleting Equipment:', error);
            toast.error(error.response?.data?.message || 'Failed to delete Equipment.');
        }
    }

    const handleAddDepartment = (newDepartment) => {
        if (!newDepartment || !newDepartment._id) {
          alert("Department ID is Missing!!");
          return;
        }

      //To Update a previous Data
        setDepartment((prevDepartment) => [...prevDepartment, newDepartment]);
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
    
            <h2 className="text-xl font-bold mb-4">Department Table</h2>
    
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
                  <th className="p-4 border-b border-gray-300">Department Name</th>
                  <th className="p-4 border-b border-gray-300 flex justify-center items-center">
                    <button 
                    onClick={() => handleAddClick()}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600">
                      <FaPlus className="w-5 h-5" />
                    </button>
    
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartment.length === 0 ?  (
                  <tr>
                    <td
                      colSpan={6}
                      className="border p-2 text-center text-gray-500"
                    >
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  paginatedDepartment.map((department) => (
                    <tr key={department._id} className="hover:bg-gray-100">
                      <td className="border p-2">{department.DepartmentName}</td>
                      <td className="border p-2 flex space-x-2 justify-center">
                        <button
                          onClick={() => handdleDepartmentSelect(department)}
                          className="px-3 py-1 text-white  bg-blue-500 rounded hover:bg-blue-600 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
    
                        <button
                          onClick={() => handdleDelete(department._id)}
                          className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          <i className="fas fa-trash-alt"></i>
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
            {isAddFormOpen &&(
                <DepartmentFormModal
                isOpen={isAddFormOpen}
                onAddDepartment={handleAddDepartment}
                onUpdate={handleUpdateDepartment}
                department={selectedDepartment}
                onClose={handleCloseModal}
              
                />

              )}
          </div>
        </div>
      );
}

export default DepartmentTables