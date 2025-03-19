import React, { useState } from "react";
import PopupModal from "./popupModal"; // Import the PopupModal component

const EquipmentTable = ({
  equipment,
  loading,
  onDeleteEquip,
  onEquipSelect,
  equipmentPerPage,
  setCurrentPage,
  currentPage,
  totalEquipment,
  setEquipmentPerPage, // This was missing in your code
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const handleAssignClick = (equipment) => {
    setIsModalOpen(true);
    setSelectedEquipment(equipment); // Set the selected equipment
  };
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleConfirmAssignment = () => {
    if (selectedEquipment) {
      // Handle the assignment logic here
      console.log("Assigned Equipment:", selectedEquipment);
    }
    handleCloseModal(); // Close the modal after confirmation
  };

  const totalPages = Math.ceil(totalEquipment / equipmentPerPage); // Calculate total pages

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return; // Check for valid page number
    setCurrentPage(pageNumber); // Update current page
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        {/* Loading Spinner SVG */}
      </div>
    );

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter((equipments) =>
    equipments.Brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isNoEquipment = filteredEquipment.length === 0; // Fixed here

  return (
    <div className="flex flex-col  bg-white shadow-md rounded-xl bg-clip-border px-4 py-4">
      <div>
        
        <div class="flex rounded-full border-2 border-blue-500 overflow-hidden max-w-md  font-[sans-serif] my-2 text-black">
          <input
            type="email"
            placeholder="Search Something..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            class="w-full outline-none bg-white text-sm px-5 py-3"
          />
          <button
            type="button"
            class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 192.904 192.904"
              width="18px"
              class="fill-white"
            >
              <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
            </svg>
          </button>
        </div>
        <div className="flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border px-4 py-4">
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Serial#
                  </th>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    BrandName
                  </th>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Specification
                  </th>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Status
                  </th>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Category
                  </th>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isNoEquipment ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-300 p-2 text-center text-gray-500"
                    >
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((equipment) => (
                    <tr
                      key={equipment._id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="border border-gray-300 p-2">
                        {equipment.SerialNumber}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {equipment.Brand}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {equipment.Specification}
                      </td>
                      <td
                        className={`border border-gray-300 p-2 ${
                          equipment.status === "Available"
                            ? "text-green-500"
                            : equipment.status === "Not Available"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {equipment.status === "Available" ? (
                          <>
                            <i className="fas fa-check-circle mr-2"></i>{" "}
                            {/* Available icon */}
                            {equipment.status}
                          </>
                        ) : equipment.status === "Not Available" ? (
                          <>
                            <i className="fas fa-times-circle mr-2"></i>{" "}
                            {/* Not Available icon */}
                            {equipment.status}
                          </>
                        ) : (
                          equipment.status
                        )}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {equipment.CategoryName || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2 flex space-x-2">
                        <button
                          onClick={() => onEquipSelect(equipment)}
                          className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                        >
                          <i className="fas fa-edit"></i>{" "}
                          {/* Font Awesome edit icon */}
                        </button>
                        <button
                          onClick={() => onDeleteEquip(equipment._id)}
                          className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                        >
                          <i className="fas fa-trash-alt"></i>{" "}
                          {/* Font Awesome trash icon */}
                        </button>
                        <>
                          <button
                            onClick={() => handleAssignClick(equipment)} // Pass the current equipment
                            className="px-3 py-1 text-white bg-orange-500 rounded hover:bg-red-600 transition flex items-center space-x-2"
                          >
                            {equipment.status === "Not Available" ? (
                              <>
                                <i className="fas fa-sync-alt"></i>{" "}
                                {/* Re-Assign icon */}
                                <span>Re-Assign</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus-circle"></i>{" "}
                                {/* Assign icon */}
                                <span>Assign</span>
                              </>
                            )}
                          </button>

                          <PopupModal
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                            onConfirm={handleConfirmAssignment}
                            equipment={selectedEquipment} // Pass the selected equipment
                          />
                        </>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex space-x-1 justify-center mt-4">
            <button
              className={`rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1} // Disabled if on first page
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`min-w-9 rounded-full py-2 px-3.5 text-center text-sm transition-all shadow-sm ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "border border-slate-300 text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              className={`rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500 ${
                currentPage === totalPages || isNoEquipment
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || isNoEquipment}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentTable;
