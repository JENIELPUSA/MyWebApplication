import React, { createContext, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest";

import axiosInstance from "../../ReusableComponent/axiosInstance";
export const IncomingDisplayContext = createContext();

export const IncomingDisplayProvider = ({ children }) => {
  const { addDescription } = useContext(RequestDisplayContext);
  const { authToken } = useContext(AuthContext);

  const fetchIncomingData = async () => {
    if (!authToken) return;
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/IncomingRequests`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const departmentData = res.data?.data;

      if (res.data?.status === "success" && Array.isArray(departmentData) && departmentData.length > 0) {
        // Add descriptions
        await Promise.all(
          departmentData.map(item =>
            addDescription(item.Description, item.Equipments, item.Laboratory, item.Department)
          )
        );

        // Delete each item
        await Promise.all(
          departmentData.map(async item => {
            try {
              await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/IncomingRequests/${item._id}`);
            } catch (err) {
              console.error(`Failed to delete ${item._id}:`, err.message);
            }
          })
        );
      } else {
        console.log("No incoming requests found.");
      }

    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  useEffect(() => {
    if (authToken) fetchIncomingData();
  }, [authToken]);

  return (
    <IncomingDisplayContext.Provider value={{ fetchIncomingData }}>
      {children}
    </IncomingDisplayContext.Provider>
  );
};
