import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUserPlus, FaUserEdit, FaEnvelope, FaLock, FaUserTag, FaIdCard, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { UserDisplayContext } from "../Context/User/DisplayUser";

function SignUpForm({ onClose, isOpen, user, onUpdate, onAddUser }) {
  const [animateExit, setAnimateExit] = useState(false);
  const [customError, setCustomError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { AddUser, UpdateUser } = useContext(UserDisplayContext);
  const [selectedRole, setSelectedRole] = useState(user?.role || "Select Role");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [values, setValues] = useState({
    FirstName: "",
    Middle: "",
    LastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  useEffect(() => {
    if (isOpen) {
      setValues({
        FirstName: user?.FirstName || "",
        Middle: user?.Middle || "",
        LastName: user?.LastName || "",
        email: user?.email || "",
        password: "",
        confirmPassword: "",
        role: user?.role || "",
      });
      setSelectedRole(user?.role || "Select Role");
    }
  }, [user, isOpen]);

  const handleClose = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValues((prev) => ({ ...prev, role }));
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError("");
    
    // Validation Logic
    if (!values.FirstName || !values.LastName || !values.email || !values.role) {
      setCustomError("Please fill in all required personnel fields.");
      return;
    }
    if (!user && (values.password !== values.confirmPassword)) {
      setCustomError("Credential passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = user ? await UpdateUser(user._id, values) : await AddUser(values);

    if (result?.success) {
      user ? onUpdate(result.data) : onAddUser(result.data);
      handleClose();
    } else {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      <motion.div
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header - Industrial Deep Blue */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors">
            <FaTimes size={20} />
          </button>
          
          <div className="flex items-center gap-4">
             <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a]">
                {user ? <FaUserEdit size={24} /> : <FaUserPlus size={24} />}
             </div>
             <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  {user ? "Update" : "Personnel"} <span className="text-yellow-400">Account</span>
                </h2>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">User Access Management Terminal</p>
             </div>
          </div>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {customError && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-black uppercase tracking-wider rounded-r-md">
              Error: {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative group">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                  <input type="text" name="FirstName" value={values.FirstName} onChange={handleInput} placeholder="Enter First Name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all" />
                </div>
              </div>
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Middle Name</label>
                <input type="text" name="Middle" value={values.Middle} onChange={handleInput} placeholder="Optional"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input type="text" name="LastName" value={values.LastName} onChange={handleInput} placeholder="Enter Surname"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all" />
            </div>

            {/* Email & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                  <input type="email" name="email" value={values.email} onChange={handleInput} placeholder="email@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all" />
                </div>
              </div>
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
                <div onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer hover:border-blue-400 transition-all">
                  <span className={`text-sm font-bold ${values.role ? "text-slate-700" : "text-slate-400"}`}>{selectedRole}</span>
                  {dropdownOpen ? <FaChevronUp className="text-blue-600 shadow-sm" /> : <FaChevronDown className="text-slate-300" />}
                </div>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden border-t-4 border-t-yellow-400">
                      {["Admin", "Technician", "User"].map((role) => (
                        <div key={role} onClick={() => handleRoleSelect(role)}
                          className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                          {role}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Password Fields - Hidden during Edit if not needed */}
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="password" name="password" value={values.password} onChange={handleInput} placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 outline-none font-bold text-sm transition-all" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                  <input type="password" name="confirmPassword" value={values.confirmPassword} onChange={handleInput} placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 outline-none font-bold text-sm transition-all" />
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3 mt-4
                ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"}`}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (user ? "Update Account" : "Deploy Personnel")}
            </button>
          </form>
        </div>

        {/* Footer Accent */}
        <div className="bg-yellow-400 py-2 text-center">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.3em]">Authorized Information Entry</p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUpForm;
