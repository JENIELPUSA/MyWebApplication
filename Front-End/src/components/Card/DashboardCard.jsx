// src/components/DashboardCard.jsx
import { MdPerson, MdBuild, MdScience, MdApartment, MdCheckCircle, MdHourglassEmpty, MdWarning, MdPending, MdCheck, MdClose, MdSmsFailed, MdDoneAll, MdSchedule, MdAssignment, MdDevices, MdInventory, MdErrorOutline, MdOutlineCheckCircle, MdOutlinePending, MdOutlineWarning, MdChevronLeft, MdChevronRight } from "react-icons/md";
import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from "react";
import { EquipmentDataContext } from "../../contexts/EquipmentContext/EquipmentContext.jsx";
import { LaboratoryContext } from "../../contexts/LaboratoryContext/LaboratoryContext.jsx";
import { UserDataContext } from "../../contexts/UserContext/UserContext.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { FilterSpecificAssignContext } from "../../contexts/FilterSpecificAssignContext/FilterSpecificAssignContext.jsx";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

function DashboardCard({ statisticsData, technicianStats }) {

  console.log("technicianStats", technicianStats?.dashboardCards);
  
  // Extract summary data from statisticsData
  const summary = statisticsData?.summary || {};
  const technicianCard = technicianStats?.dashboardCards || {};

  const [piedataTechnician, setPiedatatoTechnician] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const carouselRef = useRef(null);
  const autoSlideInterval = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  // Safe context usage with null checks
  const filterContext = useContext(FilterSpecificAssignContext);
  const maintenanceContext = useContext(MaintenanceRequestContext);
  const authContext = useContext(AuthContext);
  const equipmentContext = useContext(EquipmentDataContext);
  const laboratoryContext = useContext(LaboratoryContext);
  const userContext = useContext(UserDataContext);

  // Safe destructuring with default values
  const laboratoryData = filterContext?.laboratoryData ?? {};
  const request = maintenanceContext?.request ?? [];
  const role = authContext?.role ?? null;
  const FirstName = authContext?.FirstName ?? "";
  const LastName = authContext?.LastName ?? "";
  const equipment = equipmentContext?.equipment ?? [];
  const laboratories = laboratoryContext?.laboratories ?? [];
  const users = userContext?.users ?? [];

  const [pending, setPending] = useState(0);
  const [under, setUnder] = useState(0);
  const [Accomplish, setAccomplish] = useState(0);
  const [Assigning, setAssigning] = useState(0);
  const [availables, setAvailables] = useState(0);

  const fullName = `${FirstName ?? ""} ${LastName ?? ""}`.trim();

  // Responsive cards per page
  useEffect(() => {
    const updateCardsPerPage = () => {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };

    updateCardsPerPage();
    window.addEventListener('resize', updateCardsPerPage);
    return () => window.removeEventListener('resize', updateCardsPerPage);
  }, []);

  // Build card data based on role - MEMOIZED to prevent unnecessary re-renders
  const getCardData = useCallback(() => {
    if (role === "Admin") {
      return [
        { icon: MdDevices, label: "Total Equipment", value: summary.totalEquipment || 0 },
        { icon: MdCheck, label: "Available", value: summary.availableEquipment || 0 },
        { icon: MdClose, label: "Not Available", value: summary.notAvailableEquipment || 0 },
        { icon: MdAssignment, label: "Assigned Equipment", value: summary.totalAssignedEquipment || 0 },
        { icon: MdInventory, label: "Unassigned Equipment", value: summary.totalUnassignedEquipment || 0 },
        { icon: MdDoneAll, label: "Total Assignments", value: summary.totalAssignments || 0 },
        { icon: MdWarning, label: "Maintenance Requests", value: summary.totalMaintenanceRequests || 0 },
        { icon: MdSchedule, label: "Maintenance Schedules", value: summary.totalMaintenanceSchedules || 0 },
        { icon: MdBuild, label: "Equipment with Schedule", value: summary.totalEquipmentWithSchedule || 0 },
        { icon: MdErrorOutline, label: "Overdue Schedules", value: summary.totalOverdueSchedules || 0 },
        { icon: MdOutlineCheckCircle, label: "Requests with Feedback", value: summary.requestsWithFeedback || 0 },
        { icon: MdOutlinePending, label: "Requests without Feedback", value: summary.requestsWithoutFeedback || 0 },
      ];
    } else if (role === "User") {
      return [
        { icon: MdApartment, label: "Department", value: laboratoryData?.departmentName ?? "N/A" },
        { icon: MdScience, label: "Laboratory", value: laboratoryData?.laboratoryName ?? "N/A" },
        { icon: MdBuild, label: "Equipments", value: laboratoryData?.equipmentsCount ?? 0 },
      ];
    } else if (role === "Technician") {
      return [
        { icon: MdWarning, label: "Maintenance Requests", value: technicianCard.totalMaintenanceRequests || 0 },
        { icon: MdSchedule, label: "Maintenance Schedules", value: technicianCard.totalMaintenanceSchedules || 0 },
        { icon: MdCheckCircle, label: "Completed Requests", value: technicianCard.completedRequests || 0 },
        { icon: MdPending, label: "Not Accomplish", value: technicianCard.notAccomplish || 0 },
        { icon: MdHourglassEmpty, label: "Completion Rate", value: technicianCard.completionRate || 0 + "%" },
        { icon: MdErrorOutline, label: "Overdue Schedules", value: technicianCard.totalOverdueSchedules || 0 },
        { icon: MdBuild, label: "With Technician", value: technicianCard.withTechnician || 0 },
        { icon: MdOutlineWarning, label: "Without Technician", value: technicianCard.withoutTechnician || 0 },
        { icon: MdOutlineCheckCircle, label: "Requests with Feedback", value: technicianCard.requestsWithFeedback || 0 },
        { icon: MdOutlinePending, label: "Requests without Feedback", value: technicianCard.requestsWithoutFeedback || 0 },
        { icon: MdPerson, label: "Requests with Technician", value: technicianCard.requestsWithTechnician || 0 },
        { icon: MdOutlineWarning, label: "Requests without Technician", value: technicianCard.requestsWithoutTechnician || 0 },
      ];
    }
    return [];
  }, [role, summary, technicianCard, laboratoryData]);

  // MEMOIZED cards to prevent recalculation on every render
  const cards = useMemo(() => getCardData(), [getCardData]);
  const totalPages = useMemo(() => Math.ceil(cards.length / cardsPerPage), [cards.length, cardsPerPage]);

  // Get current page cards - MEMOIZED
  const currentCards = useMemo(() => {
    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    return cards.slice(start, end);
  }, [cards, currentPage, cardsPerPage]);

  // Auto-slide effect - Fixed dependencies
  useEffect(() => {
    // Clear any existing interval
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = null;
    }

    // Only start auto-slide if there are more than 1 page and not paused
    if (totalPages > 1 && !isPaused) {
      autoSlideInterval.current = setInterval(() => {
        setDirection(1);
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
      }, 4000); // Slide every 4 seconds
    }

    // Cleanup interval on unmount
    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
        autoSlideInterval.current = null;
      }
    };
  }, [totalPages, isPaused]); // Only depend on totalPages and isPaused

  // Effect for technician data filtering
  useEffect(() => {
    const safeRequests = Array.isArray(request) ? request : [];
    const filteredPiedata = safeRequests.filter((item) => {
      const techName = typeof item?.Technician === "string" ? item.Technician.trim().toLowerCase() : "";
      return item?.UserId && techName === fullName.toLowerCase();
    });
    setPiedatatoTechnician(filteredPiedata);
  }, [request, fullName]);

  // Effect for calculating technician stats
  useEffect(() => {
    const safeEquipment = Array.isArray(equipment) ? equipment : [];
    const safeRequests = Array.isArray(request) ? request : [];

    if (role === "Admin") {
      setAvailables(safeEquipment.filter((item) => item?.status === "Available").length);
    } else if (role === "Technician") {
      const targetName = fullName.toLowerCase();
      const Assigned = safeRequests.filter((item) =>
        typeof item?.Technician === "string" &&
        item.Technician.toLowerCase().trim() === targetName
      );
      setUnder(piedataTechnician.filter(item => item?.Status === "Under Maintenance").length);
      setPending(piedataTechnician.filter(item => item?.Status === "Pending").length);
      setAccomplish(piedataTechnician.filter(item => item?.Status === "Success").length);
      setAssigning(Assigned.length);
    }
  }, [role, equipment, request, piedataTechnician, fullName]);

  // Navigation handlers with pause and direction - MEMOIZED
  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setIsPaused(true);
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
    // Resume auto-slide after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  }, [totalPages]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setIsPaused(true);
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    // Resume auto-slide after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  }, [totalPages]);

  const goToPage = useCallback((pageIndex) => {
    setDirection(pageIndex > currentPage ? 1 : -1);
    setIsPaused(true);
    setCurrentPage(pageIndex);
    // Resume auto-slide after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  }, [currentPage]);

  // Mouse hover handlers for pause - MEMOIZED
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Framer Motion variants for slide animations - MEMOIZED
  const slideVariants = useMemo(() => ({
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        staggerChildren: 0.1,
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      }
    })
  }), []);

  // Card item variants for individual card animations - MEMOIZED
  const cardVariants = useMemo(() => ({
    enter: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      }
    }
  }), []);

  // Reusable Card Component - BIPSU Yellow Theme with BLUE accent bar
  const CardItem = useCallback(({ icon: Icon, label, value, index }) => (
    <motion.div
      className="w-full px-3 mb-6 flex-shrink-0"
      style={{ width: `${100 / cardsPerPage}%` }}
      variants={cardVariants}
      custom={index}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.div
        className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group h-full relative overflow-hidden"
        whileHover={{
          boxShadow: "0 10px 40px rgba(26, 42, 74, 0.15)",
          borderColor: "#1a2a4a",
        }}
      >
        {/* BLUE Accent Bar */}
        <motion.div
          className="absolute top-0 left-0 w-1 h-full bg-blue-900"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* YELLOW Icon Background */}
        <motion.div
          className="p-4 rounded-xl bg-yellow-400 shadow-lg shadow-yellow-200 group-hover:scale-110 transition-transform"
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
        >
          <Icon className="h-7 w-7 text-blue-900" />
        </motion.div>

        <div className="mx-5">
          <motion.h4
            className="text-2xl font-semibold text-gray-800 leading-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {value}
          </motion.h4>
          <motion.div
            className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {label}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  ), [cardsPerPage, cardVariants]);

  // Show loading state if auth context is not ready
  if (!authContext) {
    return (
      <div className="w-full text-center py-10 text-gray-400 font-medium italic">
        Loading authentication...
      </div>
    );
  }

  // Show empty state if no cards
  if (cards.length === 0) {
    return (
      <div className="w-full text-center py-10 text-gray-400 font-medium italic">
        No data available for {role || "current"} role.
      </div>
    );
  }

  return (
    <div
      className="xs:m-2 lg:m-4 font-sans"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        {/* Auto-slide Indicator */}
        {totalPages > 1 && (
          <motion.div
            className="absolute -top-6 right-0 flex items-center gap-2 text-[10px] font-medium text-gray-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className={`inline-block w-2 h-2 rounded-full ${isPaused ? 'bg-red-400' : 'bg-green-400'} transition-colors`}
              animate={{ scale: isPaused ? 1 : [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: isPaused ? 0 : Infinity }}
            />
            <span>{isPaused ? 'Paused' : 'Auto-slide'}</span>
          </motion.div>
        )}

        {/* Carousel Container with Framer Motion */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-wrap"
              style={{
                marginLeft: '-12px',
                marginRight: '-12px'
              }}
            >
              {currentCards.map((card, index) => (
                <CardItem
                  key={`${card.label}-${index}-${currentPage}`}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls - BLUE CIRCLE ARROWS */}
        {cards.length > cardsPerPage && (
          <>
            {/* Previous Button - BLUE Circle */}
            <motion.button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 bg-blue-900 rounded-full shadow-lg shadow-blue-900/30 p-3 hover:bg-blue-800 transition-all border-2 border-blue-700 focus:outline-none"
              whileHover={{
                scale: 1.15,
                x: -3,
                boxShadow: "0 10px 30px rgba(26, 42, 74, 0.4)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              aria-label="Previous"
            >
              <MdChevronLeft className="h-6 w-6 text-yellow-400" />
            </motion.button>

            {/* Next Button - BLUE Circle */}
            <motion.button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 bg-blue-900 rounded-full shadow-lg shadow-blue-900/30 p-3 hover:bg-blue-800 transition-all border-2 border-blue-700 focus:outline-none"
              whileHover={{
                scale: 1.15,
                x: 3,
                boxShadow: "0 10px 30px rgba(26, 42, 74, 0.4)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              aria-label="Next"
            >
              <MdChevronRight className="h-6 w-6 text-yellow-400" />
            </motion.button>
          </>
        )}

        {/* Dot Indicators with Yellow Theme and Framer Motion */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center items-center gap-3 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToPage(index)}
                className={`relative h-2.5 rounded-full transition-all duration-300 focus:outline-none ${currentPage === index
                  ? 'w-10 bg-yellow-400 shadow-lg shadow-yellow-200'
                  : 'w-2.5 bg-gray-300 hover:bg-yellow-300'
                  }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.8 }}
                animate={currentPage === index ? {
                  scale: [1, 1.1, 1],
                  transition: { duration: 1, repeat: Infinity }
                } : {}}
                aria-label={`Go to page ${index + 1}`}
              >
                {/* Yellow pulse animation for active dot */}
                {currentPage === index && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-yellow-400/50"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
            ))}
            {/* Page counter */}
            <motion.span
              className="text-[10px] font-medium text-gray-400 ml-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentPage + 1} / {totalPages}
            </motion.span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard;