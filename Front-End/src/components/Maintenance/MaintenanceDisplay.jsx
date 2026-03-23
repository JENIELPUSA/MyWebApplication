import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceDisplayModal from "../MaintenanceRequest/MaintenanceModalDisplay";
<<<<<<< HEAD
import CalibrationTable from "../Calibration/CalibrationTable";
import TypesofMaintenceForm from "../TypesOfMaintenance/TypesofMaintenceForm";
import { motion } from "framer-motion";
import { AddTypeMaintenance } from "../Context/TypesofMainten/addmaintenance";
import TypeMaintenanceModal from "../TypesOfMaintenance/TypeMaintenanceModal"; // Import ang modal
import { FaExclamationCircle } from "react-icons/fa";
=======
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import TypesofMaintenceForm from "../TypesOfMaintenance/TypesofMaintenceForm";
import { motion } from "framer-motion";
import { AddTypeMaintenance } from "../Context/TypesofMainten/addmaintenance";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

function MaintenanceDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
<<<<<<< HEAD
  const [isCalibration, setCalibration] = useState(false);
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] = useState(false);
  
  // NEW STATE: Para sa PMS Modal
  const [isPMSModalOpen, setPMSModalOpen] = useState(false);

=======
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] =
    useState(false);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);

  const location = useLocation();
<<<<<<< HEAD
=======
  
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const { displayData, DeleteType } = useContext(AddTypeMaintenance);
  const [equipmentsPerPage] = useState(6);

  const laboratoryData = location.state?.selectedAssignEquipment;

<<<<<<< HEAD
  console.log("laboratoryData",laboratoryData)

=======
//gamitin lang ito kung halimbawa mag refresh na empty ang page
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [assignEquipments, setAssignEquipments] = useState(() => {
    const saved = localStorage.getItem("assignedEquipments");
    return saved ? JSON.parse(saved) : [];
  });
<<<<<<< HEAD

  console.log("assignEquipments",assignEquipments)

  const [laboratory, setlaboartory] = useState(() => {
    const saved = localStorage.getItem("selectedLabsData");
    return saved ? JSON.parse(saved) : laboratoryData || "";
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    if (laboratoryData) {
      localStorage.setItem("selectedLabsData", JSON.stringify(laboratoryData));
      setlaboartory(laboratoryData);
    }
  }, [laboratoryData]);

  useEffect(() => {
    const equipments = location.state?.selectedAssignEquipment?.equipments;
    if (equipments && equipments.length > 0) {
      localStorage.setItem("assignedEquipments", JSON.stringify(equipments));
      setAssignEquipments(equipments);
    }
=======
  //gamitin lang ito kung halimbawa mag refresh na empty ang page
  const [laboratory,setlaboartory]=useState(()=>{
    const saved = localStorage.getItem("selectedLabsData");
    //Kung may nahanap na data sa localStorage (saved), ito ay iko-convert mula sa string pabalik sa JavaScript object gamit ang JSON.parse(saved).
    return saved ? JSON.parse(saved) : laboratoryData || "";
  })
//gamitin lang ito kung halimbawa mag refresh na empty ang page
  useEffect(() => {
    //for example may value na siya na "HeadOffice" na galing sa return sa taas
    if (laboratoryData) {
      //Kapag may laman ang laboratoryData, isinasave ito sa localStorage gamit ang localStorage.setItem.
      //Ang JSON.stringify ay ginagamit para gawing string ang object (kasi localStorage ay tanging string lang ang kayang itago)
      localStorage.setItem("selectedLabsData", JSON.stringify(laboratoryData));
      setlaboartory(laboratoryData);
      console.log("fwqffq",laboratoryData)
    }
  }, [laboratoryData]);//ito ay dependencies kungmay nabago mag render yan siya
  
  
//gamitin lang ito kung halimbawa mag refresh na empty ang page
  // Store equipment list from location.state only once
  useEffect(() => {
    const equipments =
      location.state?.selectedAssignEquipment?.equipments;

      
  if (equipments && equipments.length > 0) {
        localStorage.setItem("assignedEquipments", JSON.stringify(equipments));
        setAssignEquipments(equipments);
      }


>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  }, [location.state]);

  const handleSelectEquipment = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setOpenMaintenanceModal(true);
  };

<<<<<<< HEAD
  const handleCalibration = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setCalibration(true);
  };

=======
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const handleSendData = (equipment, laboratory) => {
    setTypesofMaintenanceModal(true);
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
  };

<<<<<<< HEAD
  // NEW HANDLER: Para sa PMS button
  const handlePMSClick = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setPMSModalOpen(true);
  };

  const handleCloseModal = () => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
    setCalibration(false);
    setPMSModalOpen(false); // Isara rin ang PMS modal
=======
  const handleCloseModal = () => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  const handleRetrieve = (equipment) => {
    DeleteType(equipment);
  };

<<<<<<< HEAD
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

=======
  // Animation Variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Remove duplicate equipment entries
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const uniqueEquipments = Array.from(
    new Map(assignEquipments.map((equip) => [equip._id, equip])).values()
  );

  const filteredEquipment = uniqueEquipments.filter((equip) =>
    (equip.SerialNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEquipment.length / equipmentsPerPage);
<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * equipmentsPerPage,
    currentPage * equipmentsPerPage
  );

  const paginate = (pageNumber) => {
<<<<<<< HEAD
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const equipmentTypes = [...new Set(displayData?.map((item) => item.equipmentType))];

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={pageVariants}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={pageVariants} className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">In-charge</h2>
          <p className="text-gray-900 font-bold text-lg">{laboratory.encharge || "No Encharge Info"}</p>
        </motion.div>

        <motion.div variants={pageVariants} className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Department ID</h2>
          <p className="text-gray-900 font-bold text-lg">{laboratory._id || "No Department Info"}</p>
        </motion.div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm bg-white w-full">
        <h2 className="text-xl md:text-2xl font-black mb-4 text-blue-900">Equipment Inventory</h2>
=======
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Remove duplicate equipmentType IDs
  const equipmentTypes = [
    ...new Set(displayData?.map((item) => item.equipmentType)),
  ];

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="border rounded-lg p-4 shadow-sm bg-white w-full"
      >
        <h2 className="xs:text-xs text-lg md:text-xl font-medium text-gray-700 mb-2">
          In-charge
        </h2>
        <div className="border-t pt-2">
          <p className="xs:text-xs text-gray-900 font-semibold text-sm md:text-base">
            {laboratory.encharge || "No Encharge Info"}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="border rounded-lg p-4 shadow-sm bg-white w-full"
      >
        <h2 className="xs:text-xs text-lg md:text-xl font-medium text-gray-700 mb-2">
          Department
        </h2>
        <div className="border-t pt-2">
          <p className="xs:text-xs text-gray-900 font-semibold text-sm md:text-base">
            {laboratory._id || "No Department Info"}
          </p>
        </div>
      </motion.div>

      {/* Equipment Table */}
      <div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="border rounded-lg p-6 shadow-sm bg-white w-full"
      >
        <h2 className="xs:text-xs text-xl md:text-2xl font-bold mb-4">
          Equipment Table
        </h2>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

        <div className="mb-4">
          <input
            type="text"
<<<<<<< HEAD
            placeholder="Search Serial Number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
=======
            placeholder="Search SerialNumber..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full p-2 border rounded-lg text-sm md:text-base"
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          />
        </div>

        <div className="overflow-x-auto">
<<<<<<< HEAD
          <table className="min-w-full text-left table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Serial#</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Brand</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Category</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Last Maint.</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Next Maint.</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600 text-center">Actions</th>
=======
          <table className="min-w-full text-left table-auto border-collapse mb-4 border border-gray-300  sm:px-6 md:px-10 lg:px-20 xl:px-40">
            <thead>
              <tr>
                <th className="xs:p-1 xs:text-xs p-4 border-b border-gray-300 text-sm md:text-base">
                  Serial#
                </th>
                <th className="xs:p-1 xs:text-xs p-4 border-b border-gray-300 text-sm md:text-base">
                  Brand
                </th>
                <th className="xs:p-1 xs:text-xs  p-4 border-b border-gray-300 text-sm md:text-base">
                  Specification
                </th>
                <th className=" xs:p-1 xs:text-xs  p-4 border-b border-gray-300 text-sm md:text-base">
                  Category
                </th>
                <th className=" xs:p-1 xs:text-xs  p-4 border-b border-gray-300 text-sm md:text-base text-center">
                  Actions
                </th>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
              </tr>
            </thead>
            <tbody>
              {paginatedEquipment.length === 0 ? (
                <tr>
<<<<<<< HEAD
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                    No equipment found.
=======
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500 text-sm md:text-base"
                  >
                    No Results Found
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((equipment) => (
<<<<<<< HEAD
                  <tr key={equipment._id} className="hover:bg-blue-50/50 transition-colors border-b">
                    <td className="p-4 text-sm font-medium">{equipment.SerialNumber}</td>
                    <td className="p-4 text-sm text-gray-600">{equipment.Brand}</td>
                    <td className="p-4 text-sm text-gray-600">{equipment.categoryName}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(equipment.lastMaintenanceDate)}</td>
                    <td className="p-4 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        {formatDate(equipment.nextMaintenanceDate)}
                        {equipment.hasMaintenance && (
                          <FaExclamationCircle className="text-red-500 animate-pulse" title="Maintenance Scheduled!" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 flex space-x-2 justify-center">
                      {/* PMS BUTTON */}
                      {equipment.hasMaintenance && (
                        <button
                          onClick={() => handlePMSClick(equipment, laboratory)}
                          className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                          title="Planned Maintenance System"
                        >
                          <span className="text-[10px] font-bold">PMS</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCalibration(equipment, laboratory)}
                        className="p-2 text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                        title="Calibration"
                      >
                        <i className="fas fa-tools"></i>
                      </button>
                      <button
                        onClick={() => handleSelectEquipment(equipment, laboratory)}
                        className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
=======
                  <tr key={equipment._id} className="hover:bg-gray-100">
                    <td className="xs:p-1 xs:text-xs border p-2 text-sm md:text-base">
                      {equipment.SerialNumber}
                    </td>
                    <td className="xs:p-1 xs:text-xs border p-2 text-sm md:text-base">
                      {equipment.Brand}
                    </td>
                    <td className="xs:p-1 xs:text-xs border p-2 text-sm md:text-base">
                      {equipment.Specification}
                    </td>
                    <td className="border p-2 text-sm md:text-base">
                      {equipment.categoryName}
                    </td>

                    <td className="border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() =>
                          handleSelectEquipment(equipment, laboratory)
                        }
                        className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        <i className="fas fa-tools"></i>
                      </button>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

                      {equipmentTypes.includes(equipment._id) ? (
                        <button
                          onClick={() => handleRetrieve(equipment)}
<<<<<<< HEAD
                          className="p-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                          title="Retrieve"
=======
                          className="px-3 py-1 text-white bg-red-500 rounded hover:bg-blue-600"
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                        >
                          <i className="fas fa-sync-alt"></i>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendData(equipment, laboratory)}
<<<<<<< HEAD
                          className="p-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
                          title="Schedule Maintenance"
=======
                          className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                        >
                          <i className="fas fa-calendar-alt"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="px-4 py-2 bg-gray-100 text-sm font-bold rounded-lg disabled:opacity-30"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-gray-100 text-sm font-bold rounded-lg disabled:opacity-30"
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>

        {/* Modals Container */}
=======
{/* Pagination */}
<div className="flex flex-wrap gap-2 items-center justify-center mt-4">
  {/* Prev Button */}
  <button
    onClick={() => paginate(currentPage - 1)}
    className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded-full disabled:opacity-50"
    disabled={currentPage === 1}
  >
    Prev
  </button>

  {/* Page Numbers */}
  <div className="hidden md:flex flex-wrap justify-center gap-1 md:gap-2">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => paginate(i + 1)}
        className={`py-1 px-3 text-xs md:py-2 md:px-4 md:text-base rounded-full transition ${
          currentPage === i + 1
            ? "bg-blue-500 text-white"
            : "border border-gray-300 hover:bg-gray-100"
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>

  {/* Next Button */}
  <button
    onClick={() => paginate(currentPage + 1)}
    className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded-full disabled:opacity-50"
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>




        {/* Modals */}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        {isOpenMaintenanceModal && (
          <MaintenanceDisplayModal
            isOpen={isOpenMaintenanceModal}
            Lab={SendDataLab}
            Equip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}
<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        {isTypesofMaintenanceModal && (
          <TypesofMaintenceForm
            isOpen={isTypesofMaintenanceModal}
            toLab={SendDataLab}
            toEquip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}
<<<<<<< HEAD
        {isCalibration && (
          <CalibrationTable
            isOpen={isCalibration}
            toLab={SendDataLab}
            toEquip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}

        {/* NEW: PMS Modal Integration */}
        {isPMSModalOpen && (
          <TypeMaintenanceModal
            isOpen={isPMSModalOpen}
            onClose={handleCloseModal}
            equipmentId={SendDataEquip?._id} // Pagpasa ng ID
            equipment={SendDataEquip}       // Pagpasa ng buong data kung kailangan
            laboratory={SendDataLab}
          />
        )}
=======
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      </div>
    </motion.div>
  );
}

<<<<<<< HEAD
export default MaintenanceDisplay;
=======
export default MaintenanceDisplay;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
