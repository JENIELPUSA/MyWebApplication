import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EquipmentTable from './components/Equipment/EquipmentTable';
import Equipment from './components/Equipment/Equipment'; // Adjusted the path to ensure correct import

function EquipmentForm() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [categories, setCategories] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null); // Change to null
  const token = localStorage.getItem('token');
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [equipmentsPerPage, setUsersPerPage] = useState(6); 
  const [totalEquipments, setTotalEquipments] = useState(0);

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
      setTotalEquipments(res.data.total)
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      alert('Failed to fetch data. Please try again later.');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(`http://127.0.0.1:3000/api/v1/equipment?page=${currentPage}&limit=${equipmentsPerPage}`, setEquipment);
    fetchData('http://127.0.0.1:3000/api/v1/categorys', setCategories);
  }, [token,currentPage,equipmentsPerPage]);



  const handleDeleteEquipment = async (equipmentID) => {
    if (!equipmentID) {
      toast.error('Equipment ID is required to delete.');
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:3000/api/v1/equipment/${equipmentID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment((prevEquipment) =>
        prevEquipment.filter((equipment) => equipment._id !== equipmentID)
      );


      toast.success('Equipment deleted successfully!');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete equipment.';
      toast.error(errorMessage);
    }
  };

  const handleAddEquipment = (newEquipment) => {
    const category = categories.find((cat) => cat._id === newEquipment.Category);
    const updatedEquipment = {
      ...newEquipment,
      Category: {
        CategoryName: category ? category.CategoryName : 'N/A',
        CategoryId: category ? category._id : null  // Optionally add CategoryId if needed
      },
    };
    
    setEquipment((prevEquipment) => [...prevEquipment, updatedEquipment]);
    console.log(updatedEquipment)
  };

  const handleEditEquipment = (newEquipment) => {
    const category = categories.find((cat) => cat._id === newEquipment.Category);
    
    // Prepare the updated equipment object
    const updatedEquipment = {
      ...newEquipment,
      Category: {
        CategoryName: category ? category.CategoryName : 'N/A',
        CategoryId: category ? category._id : null,
      },
    };
  
    // Update the equipment list with the modified equipment
    setEquipment((prevEquipment) =>
      prevEquipment.map((equipment) =>
        equipment._id === newEquipment._id ? updatedEquipment : equipment
      )
    );
  
    console.log(updatedEquipment);
  };
  

  

  const handleSelectEquip = (equipments) => {
    if (equipments && equipments._id) {
      setSelectedEquipment(equipments); // Set the selected equipment for editing if valid
    } else {
      console.warn("Selected equipment has no valid ID.");
    }
    
  };


  const filteredEquipment = Object.values(equipment).filter((equip) => 
    equip.Brand && equip.Brand.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  return (
    <div className="flex flex-col md:flex-row h-screen">
  
      {/* Main Content */}
      <div className="flex flex-col flex-grow bg-gray-600 text-white">
        {/* Navbar */}
        <div className="h-16 bg-gray-500">
          <Navbar />
        </div>
  
        {/* Equipment Content */}
        <div className="flex flex-col lg:flex-row p-4 bg-transparent space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Equipment Form */}
          <div className="w-full lg:w-1/3 bg-transparent p-4 rounded">
          <Equipment
            equipment={selectedEquipment}
            onAddEquipment={handleAddEquipment}
            onEditEquipment={handleEditEquipment}
          />
          </div>
  
          {/* Equipment Table */}
          <div>
          <EquipmentTable
            equipment={filteredEquipment}
            onDeleteEquip={handleDeleteEquipment}
            //FROM EQUIPMENT TABLE PASS TO THE PARENT COMPONENT & MAKE A HANDLE FUNCTION TO CREATE AN ANOTHER LOGIC
            onEquipSelect={handleSelectEquip}
            loading={loading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            equipmentPerPage={equipmentsPerPage}
            setUsersPerPage={setUsersPerPage}
            totalEquipment={totalEquipments}
          />
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default EquipmentForm;
