import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LaboratoryTable from './LaboratoryTable';
import { FaFlask } from 'react-icons/fa';

function LaboratoryContent() {
    const [laboratories, setLaboratories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('token');
    const [currentPage, setCurrentPage] = useState(1);
    const [laboratoryPerPage, setLaboratoryPerPage] = useState(6);
    const [totalLaboratories, setTotalLaboratories] = useState(0);
    const [selectedLab, setSelectedLab] = useState(null);

    // Fetch data from API
    const fetchData = async (url) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLaboratories(res.data.data);
            setTotalLaboratories(res.data.total);
        } catch (error) {
            console.error('Error fetching data:', error.response ? error.response.data : error.message);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(`http://127.0.0.1:3000/api/v1/laboratory?page=${currentPage}&limit=${laboratoryPerPage}`);
    }, [token, currentPage, laboratoryPerPage]);

    // Filter laboratories based on search
    const filteredLaboratories = laboratories.filter((lab) =>
        lab.LaboratoryName && 
        lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteLab = async (laboratoryId) => {
        if (!laboratoryId) return;

        if (window.confirm("Are you sure you want to delete this laboratory?")) {
            try {
                await axios.delete(`http://127.0.0.1:3000/api/v1/laboratory/${laboratoryId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLaboratories((prevLabs) =>
                    prevLabs.filter((laboratory) => laboratory._id !== laboratoryId)
                );
            } catch (error) {
                console.error('Error deleting laboratory:', error);
            }
        }
    };

    const handleAddLaboratory = (newLaboratory) => {
        setLaboratories((prevLaboratories) => [...prevLaboratories, newLaboratory]);
    };

    const handleUpdateLaboratory = (updatedLaboratory) => {
        setLaboratories((prevLaboratories) =>
            prevLaboratories.map((lab) =>
                lab._id === updatedLaboratory._id ? updatedLaboratory : lab
            )
        );
    };

    const handleSelectLaboratory = (laboratory) => {
        if (laboratory && laboratory._id) {
            setSelectedLab(laboratory);
        } else {
            console.warn('Selected laboratory has no valid ID.');
        }
    };

    return (
        <div className="w-full min-h-screen p-6">
            {/* Main Content - Table Only */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <LaboratoryTable
                    laboratories={filteredLaboratories}
                    loading={loading}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    laboratoryPerPage={laboratoryPerPage}
                    setLaboratoryPerPage={setLaboratoryPerPage}
                    totalLaboratories={totalLaboratories}
                    onDeleteLab={handleDeleteLab}
                    onLabSelect={handleSelectLaboratory}
                    onAddLaboratory={handleAddLaboratory}
                    onUpdateLaboratory={handleUpdateLaboratory}
                    selectedLab={selectedLab}
                    setSelectedLab={setSelectedLab}
                />
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    <strong>Error:</strong> {error.response?.data?.message || error.message}
                </div>
            )}
        </div>
    );
}

export default LaboratoryContent;