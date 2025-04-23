import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AssignContext } from "../Context/DisplayAssignContext.jsx";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner.jsx";
const AssignLab = () => {
  const { Assignlaboratories, loading, error } = useContext(AssignContext); // Access data from context
  const [uniqueLaboratories, setUniqueLaboratories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Items per page for pagination
  const navigate = useNavigate();

  // useEffect to process unique laboratories
  useEffect(() => {
    if (Assignlaboratories && Assignlaboratories.length > 0) {
      const processedLabs = Assignlaboratories.reduce((acc, lab) => {
        const existing = acc.find(
          (item) => item.departmentName === lab.departmentName
        );
        if (existing) {
          existing.count += 1; // Increment the count for duplicates
        } else {
          acc.push({
            ...lab, // Include all fields from the lab
            count: 1, // Initialize count
          });
        }
        return acc;
      }, []);
      setUniqueLaboratories(processedLabs);
    } else {
      setUniqueLaboratories([]); // Reset state if no labs
    }
  }, [Assignlaboratories]);

  // Filter data based on search query
  const filteredLaboratories = uniqueLaboratories?.filter((lab) =>
    lab.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastLab = currentPage * itemsPerPage;
  const indexOfFirstLab = indexOfLastLab - itemsPerPage;
  const currentLabs = filteredLaboratories.slice(
    indexOfFirstLab,
    indexOfLastLab
  );
  const totalPages = Math.ceil(filteredLaboratories.length / itemsPerPage);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle selection of a lab and navigate with data
  const handleSelectDisplay = (selectedLab) => {
    console.log("Selected Lab:", selectedLab);
    navigate("/LaboratoryAssign", { state: { selectedLab } }); // Send data to another route
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto px-4">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Display filtered laboratories */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentLabs.length > 0 ? (
          currentLabs.map((lab) => (
            <div
              key={lab._id}
              className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-center items-center transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
            >
              <div className="flex justify-center mb-4">
                <img
                  src="/Image/logo.jpg"
                  alt="Lab Logo"
                  className="w-20 h-20 rounded-full"
                />
              </div>
              <h4 className="mb-2 text-center text-xl font-bold text-gray-700 ">
                {lab.departmentName || "N/A"}
              </h4>
              <p className="mb-3 text-center text-sm text-gray-700 dark:text-gray-400">
                Number of Laboratories: {lab.count}
              </p>
              <button
                onClick={() => handleSelectDisplay(lab.departmentName)} // Pass selected lab
                className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center h-64 flex items-center justify-center">
            <p className="text-gray-700 dark:text-gray-400">
              No data available. Please add new laboratories.
            </p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {filteredLaboratories.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-l-lg disabled:bg-gray-400"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-r-lg disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignLab;
