import React, { useState, useEffect } from 'react';
import DepartmentTables from './DepartmentTables';
import axios from 'axios';
import { FaBuilding } from 'react-icons/fa';

function DepartmentContent() {
    const [department, setDepartment] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const [departmentPerPage, setDepartmentsPerPage] = useState(6);
    const token = localStorage.getItem('token');

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
            setDepartment(res.data.data);
        } catch (error) {
            console.error('Error fetching data:', error.response ? error.response.data : error.message);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, departmentPerPage, token]);

    const handleDelete = async (departmentId) => {
        if (!departmentId) return;
        
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                await axios.delete(`http://127.0.0.1:3000/api/v1/departments/${departmentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDepartment((prevDepartment) => 
                    prevDepartment.filter((depart) => depart._id !== departmentId)
                );
            } catch (error) {
                console.error('Error deleting department:', error);
            }
        }
    };

    const filteredDepartment = Object.values(department).filter((depart) => 
        depart.DepartmentName && 
        depart.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col overflow-hidden">

            <div className="flex-1 overflow-hidden p-6">
                <DepartmentTables
                    department={filteredDepartment}
                    loading={loading}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    departmentPerPage={departmentPerPage}
                    onDeleteDepartment={handleDelete}
                />
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="flex-shrink-0 px-6 py-2 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-600">
                        <strong>Error:</strong> {error.response?.data?.message || error.message}
                    </p>
                </div>
            )}
        </div>
    );
}

export default DepartmentContent;