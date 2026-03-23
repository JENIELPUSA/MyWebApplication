<<<<<<< HEAD
import React, { useState, useContext } from "react";
import { UserContext } from "../CountContext";
import { UserDisplayContext } from "../Context/User/DisplayUser";
import { 
  FaPlus, FaEdit, FaTrashAlt, FaTimes, 
  FaSearch, FaChevronLeft, FaChevronRight, FaUserShield 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import UserFormModal from "./SignUpForm";
=======
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import UserFormModal from "./SignUpForm";
import { UserContext } from "../CountContext";
import { UserDisplayContext } from "../Context/User/DisplayUser";

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
const UserTable = ({ isOpen, onClose }) => {
  const [animateExit, setAnimateExit] = useState(false);
  const {
    users,
    usersPerPage,
    currentPage,
    setCurrentPage,
    setUsers,
    DeleteUser,
<<<<<<< HEAD
    loading // Siguraduhin na ang context ay may loading state
  } = useContext(UserDisplayContext);
  
  const { setUserCount } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // --- HANDLERS (DEFINED BEFORE USE) ---
=======
  } = useContext(UserDisplayContext);
  const { setUserCount } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null); // State for the user to be edited
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const [isAddFormOpen, setAddFormOpen] = useState(false);

  const token = localStorage.getItem("token"); // Retrieve your token

  if (!isOpen) return null;

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedUser(null);
  };
<<<<<<< HEAD

  const handleAddClick = () => {
    setSelectedUser(null);
    setAddFormOpen(true);
  };

  const onUserSelect = (user) => {
    setSelectedUser(user);
    setAddFormOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await DeleteUser(userId);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setUserCount((prev) => prev - 1);
      } catch (err) {
      }
    }
  };

  // --- LOGIC: FILTER & PAGINATION ---
const filteredUsers = users
  ?.filter(Boolean)
  .filter((user) =>
    `${user.FirstName} ${user.Middle || ""} ${user.LastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
=======
  const handleDeleteUser = async (userId) => {
    await DeleteUser(userId);
    setUsers((prevEquipment) => {
      const updated = prevEquipment.filter((user) => user._id !== userId);
      return updated;
    });
    setUserCount((prevCount) => prevCount - 1);
  };

  const onUserSelect = (user) => {
    setAddFormOpen(true);
    setSelectedUser(user);
  };

  const handleUpdateUser = (updatedUser) => {
    console.log(updatedUser);
    if (!updatedUser || !updatedUser._id) {
      alert("User ID is missing. Cannot update.");
      return;
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      )
    );

    // Optionally, if you want to fetch the updated users from the server
    // fetchUsers();
  };

  const handleAddUser = (newUser) => {
    if (!newUser || !newUser._id) {
      alert("User ID is missing. Cannot add to the table.");
      return;
    }

    setUsers((prevUsers) => [...prevUsers, newUser]);

    // Optionally, if you want to fetch all users from the server after adding
    // fetchUsers();
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    `${user.FirstName} ${user.Middle} ${user.LastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage); // Calculate total pages

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const paginatedUser = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

<<<<<<< HEAD
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { setAnimateExit(true); setTimeout(onClose, 300); }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* MODAL BODY */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={animateExit ? { opacity: 0, scale: 0.95, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <FaUserShield size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">User Directory</h2>
              <p className="text-sm text-gray-500 font-medium">Manage system access and roles</p>
            </div>
          </div>
          <button
            onClick={() => { setAnimateExit(true); setTimeout(onClose, 300); }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <FaTimes className="text-gray-400 group-hover:text-red-500" size={20} />
          </button>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="p-6 flex flex-col sm:flex-row gap-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 active:scale-95"
          >
            <FaPlus /> <span>Add User</span>
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 overflow-auto px-6 py-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">Loading users...</td>
                </tr>
              ) : paginatedUser.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-400 font-medium italic">
                    No matching users found.
=======
  return (
    <motion.div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 px-2 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg shadow-lg max-h-[90vh] sm:max-h-none overflow-y-auto"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }} // Shrinks on click
          whileHover={{ scale: 1.1 }} // Enlarges on hover
          transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
          onClick={() => {
            setAnimateExit(true); // Set the animation state to trigger upward motion
            setTimeout(onClose, 500); // Close after 500ms to match the animation duration
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h2 className="text-xl font-bold mb-4 xs:text-sm xs:p-2 lg-p-2 lg:text-lg">
          User Table
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search FullName..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg xs:text-sm xs:p-2 lg-p-2 lg:text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">
                  Name
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">
                  Email
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">
                  Role
                </th>
                <th>
                  <button
                    onClick={() => handleAddClick()}
                    className=" px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    <FaPlus className="xs:w-3 xs:h-3 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUser.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500"
                  >
                    No Results Found
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                  </td>
                </tr>
              ) : (
                paginatedUser.map((user) => (
<<<<<<< HEAD
                  <motion.tr
                    layout
                    key={user._id}
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-indigo-50/30 transition-all group"
                  >
                    <td className="px-4 py-4 rounded-l-2xl border-y border-l">
                      <div className="font-bold text-gray-800">
                        {`${user.FirstName} ${user.Middle ? user.Middle + " " : ""}${user.LastName}`}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-y font-medium text-gray-500">
                      {user.username}
                    </td>
                    <td className="px-4 py-4 border-y text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 rounded-r-2xl border-y border-r text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onUserSelect(user)}
                          className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                          title="Edit User"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                          title="Delete User"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
=======
                  <tr key={user._id} className="hover:bg-gray-100">
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">{`${
                      user.FirstName
                    } ${user.Middle ? user.Middle + " " : ""}${
                      user.LastName
                    }`}</td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">
                      {user.email}
                    </td>
                    <td className=" xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">
                      {user.role}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() => onUserSelect(user)}
                        className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                      >
                        <i className="fas fa-edit"></i>{" "}
                        {/* Font Awesome edit icon */}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                      >
                        <i className="fas fa-trash-alt"></i>{" "}
                        {/* Font Awesome trash icon */}
                      </button>
                    </td>
                  </tr>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                ))
              )}
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        {/* FOOTER / PAGINATION */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {Math.min(filteredUsers.length, (currentPage - 1) * usersPerPage + 1)} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
          </div>

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-20 hover:text-indigo-600 transition-colors"
            >
              <FaChevronLeft size={12} />
            </button>

            <div className="flex gap-1">
              {getPageNumbers().map((num, i) => (
                <button
                  key={i}
                  onClick={() => typeof num === "number" && paginate(num)}
                  disabled={num === "..."}
                  className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all ${
                    currentPage === num
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : num === "..." ? "cursor-default text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || filteredUsers.length === 0}
              className="p-2 disabled:opacity-20 hover:text-indigo-600 transition-colors"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* FORM MODAL */}
      <AnimatePresence>
        {isAddFormOpen && (
          <UserFormModal
            isOpen={isAddFormOpen}
            onAddUser={(newUser) => {
              setUsers(prev => [...prev, newUser]);
              handleCloseModal();
            }}
            onUpdate={(updated) => {
              setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
              handleCloseModal();
            }}
=======
        {/* Pagination */}
        <div className="flex flex-row items-center justify-between flex-wrap mt-4 text-sm gap-2">
          {/* Left side: Page X of Y */}
          <div className="text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          {/* Right side: Prev and Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <button
              onClick={() => paginate(currentPage + 1)}
              className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Showing Info */}
        <div className="mt-2 text-sm text-center text-gray-700">
          Showing {(currentPage - 1) * usersPerPage + 1} to{" "}
          {Math.min(currentPage * usersPerPage, filteredUsers.length)} of{" "}
          {filteredUsers.length} results
        </div>

        {isAddFormOpen && (
          <UserFormModal
            isOpen={isAddFormOpen}
            onAddUser={handleAddUser}
            onUpdate={handleUpdateUser}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
            user={selectedUser}
            onClose={handleCloseModal}
          />
        )}
<<<<<<< HEAD
      </AnimatePresence>
    </div>
  );
};

export default UserTable;
=======
      </motion.div>
    </motion.div>
  );
};

export default UserTable;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
