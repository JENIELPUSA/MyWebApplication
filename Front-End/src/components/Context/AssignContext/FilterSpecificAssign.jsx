import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext.jsx";
import { AssignContext } from "../DisplayAssignContext.jsx";

export const FilterSpecificAssignContext = createContext();

export const FilterSpecificAssignProvider = ({ children }) => {

  const { Assignlaboratories } = useContext(AssignContext) ?? {};

  const [laboratoryData, setLaboratoryData] = useState(null);
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    if (Array.isArray(Assignlaboratories) && userId) {
      setLaboratoryData(
        Assignlaboratories.find(
          (lab) => lab.enchargeId?.toLowerCase() === userId.toLowerCase()
        ) || null
      );
    }
  }, [Assignlaboratories, userId]); 
  
  return (
    <FilterSpecificAssignContext.Provider value={{ laboratoryData }}>
      {children}
    </FilterSpecificAssignContext.Provider>
  );
};
