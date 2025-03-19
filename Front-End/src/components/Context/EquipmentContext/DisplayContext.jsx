import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";

export const EquipmentDisplayContext = createContext();

export const EquipmentDisplayProvider = ({ children }) => {
  const [equipment, setEquipment] = useState([""]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [totalEquipments, setTotalEquipments] = useState(0); // Initialize total equipment count
  const [TotalAvailableEquipments, setTotalAvailableEquipments] = useState(0);
  const { authToken } = useContext(AuthContext); // Get token from localStorage
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentsPerPage, setequipmentsPerPage] = useState(6);

  useEffect(() => {
    if (!authToken) {
      setEquipment(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchEquipmentData();
  }, [authToken]); // Trigger effect when the token changes

  const fetchEquipmentData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/equipment`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Extract data from response
      const equipmentData = res.data.data;

      // Count equipment with status "Available"
      const availableEquipmentCount = equipmentData.filter(
        (item) => item.status === "Available"
      ).length;

      // Set total count for available equipment
      setTotalAvailableEquipments(availableEquipmentCount);
      // Set equipment data to state
      setEquipment(equipmentData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };

  return (
    <EquipmentDisplayContext.Provider
      value={{
        equipmentsPerPage,
        setequipmentsPerPage,
        setCurrentPage,
        currentPage,
        TotalAvailableEquipments,
        equipment,
        setEquipment,
        loading,
        error,
        totalEquipments,
        fetchEquipmentData
      }}
    >
      {children}
    </EquipmentDisplayContext.Provider>
  );
};
