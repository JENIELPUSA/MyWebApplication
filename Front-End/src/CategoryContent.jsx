import React, { useState, useEffect } from 'react';
import CategoryForm from './components/Category/CategoryForm';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CategoryTable from './components/Category/CategoryTable';
import axios from 'axios';
import {toast} from 'react-toastify';



function CategoryContent() {
    const [category, setCategory] = useState([]); // List of departments
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
    const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
    const [categoryPerPage, setDepartmentsPerPage] = useState(6); // Items per page
    const [totalDepartment, setTotalCategory] = useState(0); // Total count of departments
    const token = localStorage.getItem('token'); // Token for API authentication
    const [selectedCategory,setSelectedCategory]=useState(null)

    // Fetch data from API
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(
                `http://127.0.0.1:3000/api/v1/categorys?page=${currentPage}&limit=${categoryPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCategory(res.data.data); // Set the department data
            setTotalCategory(res.data.total); // Set the total count
        } catch (error) {
            console.error('Error fetching data:', error.response ? error.response.data : error.message);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    // Use Effect to fetch data when component mounts or pagination changes
    useEffect(() => {
        fetchData();
    }, [currentPage, categoryPerPage,token]);

    const handleAddCategory = (newCategory) => {
        if (!newCategory || !newCategory._id) {
          alert("Department ID is Missing!!");
          return;
        }
      
        setCategory((prevCategory) => [...prevCategory, newCategory]);
      };

    const handleSelectCategory =(category)=>{
        if(category && category._id){
            setSelectedCategory(category)
           
        }else{
            console.warn("Selected Category has no valid ID")
        }

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

      

      const filteredCategory = Object.values(category).filter((depart) => 
        depart.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Main Content */}
            <div className="flex flex-col flex-grow bg-gray-600 text-white">
                {/* Navbar */}
                <div className="h-16 bg-gray-500">
                    <Navbar />
                </div>

                {/* Department Content */}
                <div className="flex flex-col lg:flex-row p-4 bg-transparent space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Department Form */}
                    <div className="w-full lg:w-1/3 bg-transparent p-4 rounded">
                        <CategoryForm
                        category={selectedCategory}
                        onAddCategory={handleAddCategory} 
                        onUpdate={handleUpdateCategory}
                        />
                    </div>

                    <div className="w-full lg:w-2/3 bg-transparent p-4 rounded">
                        <CategoryTable
                            category={filteredCategory}
                            currentPage={currentPage}
                            onDeleteCategory={handleDeleteCategory}
                            onCategorySelect={handleSelectCategory}
                 
                            setCurrentPage={setCurrentPage}
                            categoryPerPage={categoryPerPage}
                            totalDepartment={totalDepartment}
             
                        />
                    </div>

                  

                </div>
            </div>
        </div>
    );
}

export default CategoryContent;
