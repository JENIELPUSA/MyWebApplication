import React, { useState, useContext } from "react";
import { UserDataContext } from "../../contexts/UserContext/UserContext";
import { 
  FaPlus, FaEdit, FaTrashAlt, FaSearch, 
  FaChevronLeft, FaChevronRight, FaUserShield 
} from "react-icons/fa";
import UserFormModal from "./SignUpForm";

const UserTable = () => {
  const {
    users,
    usersPerPage,
    currentPage,
    setCurrentPage,
    setUsers,
    DeleteUser,
    loading
  } = useContext(UserDataContext);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // --- HANDLERS ---
  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedUser(null);
  };

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
      } catch (err) {
        console.error("Error deleting user:", err);
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
  const paginatedUser = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FaUserShield size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">User Directory</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage system access and roles</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Total Users: <span className="font-bold text-blue-600 dark:text-blue-400">{users?.length || 0}</span>
        </div>
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="p-4 flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
        >
          <FaPlus size={12} /> <span>Add User</span>
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Email Address</th>
              <th className="px-6 py-3 text-center">Role</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedUser.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  No matching users found.
                </td>
              </tr>
            ) : (
              paginatedUser.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {`${user.FirstName} ${user.Middle ? user.Middle + " " : ""}${user.LastName}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => onUserSelect(user)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Edit User"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete User"
                      >
                        <FaTrashAlt size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">{Math.min(filteredUsers.length, (currentPage - 1) * usersPerPage + 1)}</span> to <span className="font-medium text-gray-700 dark:text-gray-300">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredUsers.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaChevronLeft size={10} />
          </button>
          
          <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || filteredUsers.length === 0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* FORM MODAL */}
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
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserTable;