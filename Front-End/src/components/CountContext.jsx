import React, { createContext, useState ,useEffect,useContext} from "react";
import axios from 'axios';
import { toast } from "react-toastify";
// pagawa ng context
export const EquipmentContext = createContext();

export const UserContext = createContext();

export const AddAssignContext = createContext();

export const LaboratoryContext = createContext();

export const DeleteAssignContext = createContext();



// Create the provider component(para ma inject doon sa app.js)
export const EquipmentProvider = ({ children }) => {
  const [equipmentCount, setEquipmentCount] = useState(0); // Initial count

  return (
    <EquipmentContext.Provider value={{ equipmentCount, setEquipmentCount }}>
      {children}
    </EquipmentContext.Provider>
  );
};


// Create the provider component(para ma inject doon sa app.js)
export const LaboratorytProvider = ({ children }) => {
  const [laboratoryCount, setLaboratoryCount] = useState(0); // Initial count

  return (
    <LaboratoryContext.Provider value={{ laboratoryCount, setLaboratoryCount }}>
      {children}
    </LaboratoryContext.Provider>
  );
};


// Create the provider component(para ma inject doon sa app.js)
export const UserProvider = ({ children }) => {
  const [userCount, setUserCount] = useState(0); // Initial count

  return (
    <UserContext.Provider value={{ userCount, setUserCount }}>
      {children}
    </UserContext.Provider>
  );
  //NOTE: ANG PURPOSE NITO AY PARA EVERYTIME MAY MA ADD NA BAGO SA dATA AY AUTOMATIC
  //MAG AAD DIN SIYA SA CARD PANEL PARA SA EQUIPMENT, USER AND LABORATORY.
};


export const DeleteAssignProvider = ({ children }) => {
  const [Assign, setAssign] = useState([]); // State to hold data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors
  const token = localStorage.getItem("token"); // Retrieve token from localStorage

  // Function to delete an assignment
  const deleteAssignment = async (assignId) => {
    try {
      // Perform delete operation
      await axios.delete(
        `http://127.0.0.1:3000/api/v1/AssignEquipment/${assignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Log the successful deletion
      console.log(`Assignment with ID ${assignId} deleted successfully.`);

      setLoading(true); // Set loading to false
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError("Failed to delete assignment. Please try again.");
      setLoading(false);
    }
  };



  return (
    <DeleteAssignContext.Provider
      value={{
        Assign,
        setAssign,
        loading,
        error,
        deleteAssignment, // Expose the delete function in the context
      }}
    >
      {children}
    </DeleteAssignContext.Provider>
  );
};



export const AddAssignProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [confirm, setConfirm] = useState();
 


  const addAssignEquipment = async (values, onConfirm, onClose) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:3000/api/v1/AssignEquipment',
        {
          Equipments: values.id,
          Laboratory: values.Laboratory,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if(response.data.status==="success"){
         toast.success("Department added successfully");

      }
    } catch (error) {
      console.error('Error assigning equipment:', error);
      toast.error('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddAssignContext.Provider value={{ addAssignEquipment, loading, confirm }}>
      {children}
    </AddAssignContext.Provider>
  );
};


