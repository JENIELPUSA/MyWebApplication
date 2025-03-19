import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

import {FaPlus} from "react-icons/fa";
import CategoryAddForm from "./CategoryForm"
import { CategoryDisplayContext } from "../Context/Category/Display";
const CategoryTable = ({
  isOpen,onClose
}) => {
    const {category, setCategory,currentPage,setCurrentPage,categoryPerPage} = useContext(CategoryDisplayContext); // List of departments
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
    const [totalCategory, setTotalCategory] = useState(0); // Total count of departments
    const token = localStorage.getItem('token'); // Token for API authentication
    const [selectedCategory,setSelectedCategory]=useState(null)
    const [isAddFormOpen , setAddFormOpen]= useState(false)
  

    const handleCloseModal = () => {
        setAddFormOpen(false);
        setSelectedCategory(null);
      };
    const handleAddClick =()=>{
        setAddFormOpen(true)
    }

    console.log(category)
    
        const handleAddCategory = (newCategory) => {
            if (!newCategory || !newCategory._id) {
              alert("Department ID is Missing!!");
              return;
            }
          
            setCategory((prevCategory) => [...prevCategory, newCategory]);
          };
    
        const handleSelectCategory =(category)=>{
       
                setSelectedCategory(category)
                setAddFormOpen(true);
         
    
        }
    
          const handleDeleteCategory= async (categoryId)=>{
            try{
                await axios.delete(`http://127.0.0.1:3000/api/v1/categorys/${categoryId}`,{
                    headers: {Authorization:`Bearer ${token}`},
                })
                setCategory((prevCategory) => prevCategory.filter((depart) => depart._id !== categoryId));
                toast.success('Department deleted successfully!');
    
            }catch(error){
                console.error('Error deleting Category:', error);
                toast.error(error.response?.data?.message || 'Failed to Delete Equipment!' )
            }
    
    
          }
    
          const handleUpdateCategory = (UpdateCategory)=>{
            if (!UpdateCategory || !UpdateCategory._id) {
                alert("Category ID is missing. Cannot update.");
                return;
            }
        
            setCategory((prevCategory) =>
                prevCategory.map((category) => (category._id === UpdateCategory._id ? UpdateCategory : category))
            );
    
          }

    if (!isOpen) return null;

       // Filter equipment based on search term
       const filteredCategory = category.filter((category) =>
        category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const totalPages = Math.ceil(filteredCategory.length / categoryPerPage); // Calculate total pages

    const paginatedCategory = filteredCategory.slice(
      (currentPage - 1) * categoryPerPage,
      currentPage * categoryPerPage
    );

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return; // Check for valid page number
        setCurrentPage(pageNumber); // Update current page
    };

    

 
    const isNoCategory = filteredCategory.length === 0; // Fixed here

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
    
            <h2 className="text-xl font-bold mb-4">Category Table</h2>
    
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
                  <th className="p-4 border-b border-gray-300">Category Name</th>
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
                {paginatedCategory.length === 0 ?(
                  <tr>
                    <td
                      colSpan={6}
                      className="border p-2 text-center text-gray-500"
                    >
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  paginatedCategory.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-100 just">
                      <td className="border p-2">{category.CategoryName}</td>
                      <td className="border p-2 flex space-x-2 justify-center">
                        <button
                          onClick={() => handleSelectCategory(category)}
                          className="px-3 py-1 text-white  bg-blue-500 rounded hover:bg-blue-600 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
    
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
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
            {isAddFormOpen&&(
            <CategoryAddForm
            isOpen={isAddFormOpen}
            onAddCategory={handleAddCategory}
            category={selectedCategory}
            onUpdate={handleUpdateCategory}
            onClose={handleCloseModal}

            
            />
        )}
          </div>
        </div>
       
    );
};

export default CategoryTable;
