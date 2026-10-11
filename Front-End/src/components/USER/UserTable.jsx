import React, { useState, useContext, useEffect } from "react";
import { UserDataContext } from "../../contexts/UserContext/UserContext";
import {
  Plus, ChevronLeft, ChevronRight, Edit,
  Trash2, RefreshCw, Search,
  Users, UserCheck, Mail, Shield, Hash, Info
} from "lucide-react";
import UserFormModal from "./SignUpForm";
import ConfirmDeleteModal from "../../components/ReusableComponent/ConfirmationDeleteModal";

const UserTable = () => {
  const {
    users,
    filteredUsers,
    setUsers,
    loading,
    currentPage,
    setCurrentPage,
    usersPerPage,
    setusersPerPage,
    totalPages,
    totalUsers,
    DeleteUser,
    fetchUserData,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useContext(UserDataContext);


  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  //  DELETE CONFIRMATION STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Reset sa page 1 kapag nag-change ang perPage ───────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [usersPerPage, setCurrentPage]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages || 1)) {
      setCurrentPage(pageNumber);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAddClick = () => {
    setSelectedUser(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormModalOpen(true);
  };

  const handleCloseSubModals = () => {
    setFormModalOpen(false);
    setSelectedUser(null);
  };

  //  Buksan ang delete modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  //  Isara ang delete modal
  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  //  Actual delete (tatawagin ng ConfirmDeleteModal)
  const handleConfirmDelete = async () => {
    if (!userToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await DeleteUser(userToDelete._id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert("Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const getRoleStyle = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700";
      case "technician":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700";
      case "encharge":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-300 dark:border-cyan-700";
      case "user":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600";
    }
  };

  const getInitials = (user) => {
    if (!user) return "N/A";
    const first = user.FirstName?.charAt(0) || "";
    const last = user.LastName?.charAt(0) || "";
    const initials = (first + last).toUpperCase();
    return initials || "N/A";
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-slate-400";
    const colors = [
      "bg-blue-600", "bg-blue-700", "bg-indigo-600",
      "bg-amber-500", "bg-yellow-600", "bg-cyan-600",
      "bg-sky-600", "bg-blue-500", "bg-amber-600"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getFullName = (user) => {
    if (!user) return "N/A";
    return `${user.FirstName || ""} ${user.Middle ? user.Middle + " " : ""}${user.LastName || ""}`.trim() || "N/A";
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center
          bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/30">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                User Directory
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                Manage system access and roles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Refresh user list"
            >
              <RefreshCw size={16} />
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Users:{" "}
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {totalUsers || 0}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & ADD BAR */}
        <div className="p-4 flex flex-col sm:flex-row gap-3
          bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={16} />
            <input
              type="text"
              placeholder="Search name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Technician">Technician</option>
            <option value="Encharge">Encharge</option>
            <option value="User">User</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}|${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("|");
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt|desc">Newest First</option>
            <option value="createdAt|asc">Oldest First</option>
            <option value="FirstName|asc">Name (A-Z)</option>
            <option value="FirstName|desc">Name (Z-A)</option>
            <option value="email|asc">Email (A-Z)</option>
          </select>

          {/* Add Button */}
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-4 py-2
              bg-gradient-to-b from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700
              text-white rounded-lg transition-all text-sm font-semibold
              shadow-sm shadow-blue-500/30 whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Add User</span>
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
                text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
                border-b border-blue-800 dark:border-slate-700">
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><UserCheck size={12} /> Full Name</div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><Mail size={12} /> Email Address</div>
                </th>
                <th className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2"><Shield size={12} /> Role</div>
                </th>
                <th className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2"><Info size={12} /> Actions</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    {searchQuery ? 'No matching users found.' : 'No users found. Click "Add User" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={`${user._id}-${index}`}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {/* FULL NAME — with avatar */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(user.FirstName)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {getInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                            {getFullName(user)}
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate max-w-[150px]" title={user._id}>
                            {user._id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px] inline-block" title={user.email}>
                        {user.username || "N/A"}
                      </span>
                    </td>

                    {/* ROLE */}
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${getRoleStyle(user.role)}`}>
                        {user.role || "N/A"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
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
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:bg-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
          border-t border-blue-100 dark:border-slate-700
          rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-blue-700 dark:text-blue-400">
              {totalUsers === 0 ? 0 : Math.min(totalUsers, (currentPage - 1) * usersPerPage + 1)}
            </span> to{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {Math.min(currentPage * usersPerPage, totalUsers)}
            </span> of{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">{totalUsers}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Per Page */}
            <select
              value={usersPerPage}
              onChange={(e) => setusersPerPage(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700 text-blue-800 dark:text-slate-300"
            >
              {[6, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            {/* Prev */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || totalUsers === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>

            <span className="px-3 py-1 text-xs font-medium text-blue-800 dark:text-slate-300">
              Page {currentPage} of {totalPages || 1}
            </span>

            {/* Next */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === (totalPages || 1) || totalUsers === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* FORM MODAL */}
        {isFormModalOpen && (
          <UserFormModal
            isOpen={isFormModalOpen}
            onClose={handleCloseSubModals}
            user={selectedUser}
            onAddUser={(newUser) => {
              setUsers((prev) => [...prev, newUser]);
              handleCloseSubModals();
            }}
            onUpdate={(updated) => {
              setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
              handleCloseSubModals();
            }}
          />
        )}
      </div>

      {/* ============================================================
           REUSABLE DELETE CONFIRMATION MODAL
          ============================================================ */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete User?"
        description="This action cannot be undone. The user will be permanently removed from the system."
        confirmText="Yes, Delete"
        itemIcon={Users}
        itemDetails={
          userToDelete
            ? {
                code: userToDelete._id,
                brand: getFullName(userToDelete),
                specification: userToDelete.email,
                serialNumber: userToDelete.role,
              }
            : null
        }
      />
    </>
  );
};

export default UserTable;