import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LaboratoryForm from './components/Laboratories/LaboratoryForm';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LaboratoryTable from './components/Laboratories/LaboratoryTable';

function LaboratoryContent() {
  const [laboratories, setLaboratories] = useState([]); // Renamed 'laboratory' to 'laboratories'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [laboratoryPerPage, setLaboratoryPerPage] = useState(6);
  const [totalLaboratories, setTotalLaboratories] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null); // Initialize as null, not an array
  const [department ,setDepartment] = useState([])

  // Fetch data from API
  const fetchData = async (url, setState) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setState(res.data.data);
      setTotalLaboratories(res.data.total);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      alert('Failed to fetch data. Please try again later.');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(`http://127.0.0.1:3000/api/v1/laboratory?page=${currentPage}&limit=${laboratoryPerPage}`, setLaboratories);
  }, [token, currentPage, laboratoryPerPage]);

  const filteredLaboratories = laboratories.filter((lab) =>
    lab.LaboratoryName && lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteLab = async (laboratoryId) => {
    if (!laboratoryId) {
      toast.error('Laboratory ID is required to delete.');
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:3000/api/v1/laboratory/${laboratoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLaboratories((prevLabs) =>
        prevLabs.filter((laboratory) => laboratory._id !== laboratoryId)
      );

      toast.success('Laboratory deleted successfully!');
    } catch (error) {
      console.error('Error deleting laboratory:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete laboratory.';
      toast.error(errorMessage);
    }
  };

  const handleAddLaboratory = (newLaboratory) => {
    setLaboratories((prevLaboratories) => [...prevLaboratories, newLaboratory]);
  };

  const handleSelectLaboratory = (laboratory) => {
    if (laboratory && laboratory._id) {
      setSelectedLab(laboratory);
    } else {
      console.warn('Selected laboratory has no valid ID.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">

      {/* Main Content */}
      <div className="flex-grow bg-gray-600 text-white">
        {/* Navbar */}
        <div className="h-16 bg-gray-500">
          <Navbar />
        </div>

        <div className="flex flex-col lg:flex-row p-4 bg-transparent space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Laboratory Form */}
          <div className="w-full lg:w-1/3 bg-transparent p-4 rounded">
            <LaboratoryForm
              onAddLaboratory={handleAddLaboratory}
              laboratory={selectedLab} // Pass the selectedLab as prop
            />
          </div>

          {/* Laboratory Table */}
          <div>
            <LaboratoryTable
              laboratory={filteredLaboratories}
              loading={loading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              laboratoryPerPage={laboratoryPerPage}
              setLaboratoryPerPage={setLaboratoryPerPage}
              totalLaboratories={totalLaboratories}
              onDeleteLab={handleDeleteLab}
              onLabSelect={handleSelectLaboratory} // Pass the handleSelectLaboratory function as a prop
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaboratoryContent;
