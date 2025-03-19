import React, { useState, useEffect } from 'react';
import DepartmentForm from './components/Department/DepartmentForm';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DepartmentTable from './components/Department/DepartmentTable';
import axios from 'axios';
import {toast} from 'react-toastify';



function DepartmentContent() {
    const [department, setDepartment] = useState([]); // List of departments
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
    const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
    const [departmentPerPage, setDepartmentsPerPage] = useState(6); // Items per page
    const [totalDepartment, setTotalDepartments] = useState(0); // Total count of departments
    const token = localStorage.getItem('token'); // Token for API authentication
    const [selectedDepartment,setSelectedDepartment]=useState(null)

    // Fetch data from API
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

    // Use Effect to fetch data when component mounts or pagination changes
    useEffect(() => {
        fetchData();
    }, [currentPage, departmentPerPage,token]);

    const handleAddDepartment = (newDepartment) => {
        if (!newDepartment || !newDepartment._id) {
          alert("Department ID is Missing!!");
          return;
        }
      
        setDepartment((prevDepartment) => [...prevDepartment, newDepartment]);
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

      const handdleDepartmentSelect =(departments)=>{
        if(departments && departments._id){
            setSelectedDepartment(departments)
        }else{
            console.warn("Selected Department has no Valid ID!")
        }
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
    const filteredDepartment = Object.values(department).filter((depart) => 
        depart.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <DepartmentForm
                        department={selectedDepartment}
                        onAddDepartment={handleAddDepartment}
                        onUpdate={handleUpdateDepartment}
                        
                        />
                    </div>

                    {/* Department Table */}
                    <div className="w-full lg:w-2/3 bg-transparent p-4 rounded">
                        <DepartmentTable
                            department={filteredDepartment}
                            currentPage={currentPage}
                            onDepartmentSelect={handdleDepartmentSelect}
                            setCurrentPage={setCurrentPage}
                            departmentPerPage={departmentPerPage}
                            setDepartmentsPerPage={setDepartmentsPerPage}
                            totalDepartment={totalDepartment}
                            onDeleteDepartment={handdleDelete}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DepartmentContent;
