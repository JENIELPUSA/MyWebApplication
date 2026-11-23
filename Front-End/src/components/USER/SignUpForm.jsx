import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUserPlus,
  FaUserEdit,
  FaEnvelope,
  FaLock,
  FaIdCard,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaEyeSlash,
  FaWrench,
  FaCheck,
} from "react-icons/fa";
import { UserDataContext } from "../../contexts/UserContext/UserContext";

// ============================================================
// ROLE DISPLAY MAP
// ============================================================
const ROLE_DISPLAY_MAP = {
  Admin: "Admin",
  Technician: "Technician",
  User: "Incharge",
  Supply: "Supply",
};

// ============================================================
// ROLE OPTIONS
// ============================================================
const ROLE_OPTIONS = [
  { label: "Admin", value: "Admin" },
  { label: "Technician", value: "Technician" },
  { label: "Incharge", value: "User" },
  { label: "Supply", value: "Supply" },
];

// ============================================================
// CAPITALIZE WORDS
// ============================================================
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ============================================================
// SIGN UP FORM
// ============================================================
function SignUpForm({
  onClose,
  isOpen,
  user,
  onUpdate,
  onAddUser,
}) {
  const [animateExit, setAnimateExit] = useState(false);
  const [customError, setCustomError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { AddUser, UpdateUser, technicianTypes } = useContext(UserDataContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // ✅ States for Professional Technician Type Combobox
  const [isTechTypeOpen, setIsTechTypeOpen] = useState(false);
  const techTypeRef = useRef(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditMode = Boolean(user);

  // ============================================================
  // FORM VALUES
  // ============================================================
  const [values, setValues] = useState({
    FirstName: "",
    Middle: "",
    LastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    types_of_technician: "",
  });

  // ============================================================
  // INITIALIZE FORM
  // ============================================================
  useEffect(() => {
    if (isOpen) {
      setValues({
        FirstName: user?.FirstName || "",
        Middle: user?.Middle || "",
        LastName: user?.LastName || "",
        email: user?.email || user?.username || "",
        password: "",
        confirmPassword: "",
        role: user?.role || "",
        types_of_technician: user?.types_of_technician || "",
      });

      setCustomError("");
      setDropdownOpen(false);
      setIsTechTypeOpen(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsLoading(false);
    }
  }, [user, isOpen]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (techTypeRef.current && !techTypeRef.current.contains(event.target)) {
        setIsTechTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const handleClose = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  // ============================================================
  // HANDLE INPUT
  // ============================================================
  const handleInput = (e) => {
    const { name, value } = e.target;
    const NAME_FIELDS = ["FirstName", "Middle", "LastName"];
    const finalValue = NAME_FIELDS.includes(name) ? capitalizeWords(value) : value;

    setValues((prev) => ({ ...prev, [name]: finalValue }));
    if (customError) setCustomError("");
  };

  // ============================================================
  // HANDLE ROLE SELECT
  // ============================================================
  const handleRoleSelect = (roleValue) => {
    setValues((prev) => ({
      ...prev,
      role: roleValue,
      types_of_technician: roleValue === "Technician" ? prev.types_of_technician : "",
    }));
    setDropdownOpen(false);
    if (customError) setCustomError("");
  };

  // ============================================================
  // GET ROLE LABEL
  // ============================================================
  const getRoleLabel = (roleValue) => {
    if (!roleValue) return "Select Role";
    return ROLE_DISPLAY_MAP[roleValue] || roleValue;
  };

  // ============================================================
  // HANDLE TECH TYPE SELECT
  // ============================================================
  const handleTechTypeSelect = (type) => {
    setValues((prev) => ({ ...prev, types_of_technician: type }));
    setIsTechTypeOpen(false);
    if (customError) setCustomError("");
  };

  // ============================================================
  // ✅ FILTER TECHNICIAN TYPES (SAFE & CASE-INSENSITIVE)
  // ============================================================
  const filteredTechTypes = React.useMemo(() => {
    if (!Array.isArray(technicianTypes)) return [];

    const searchTerm = values.types_of_technician.trim().toLowerCase();
    if (!searchTerm) return technicianTypes;

    return technicianTypes.filter((typeObj) => {
      const label = typeObj?.types_of_technician;
      if (typeof label !== "string") return false;
      return label.toLowerCase().includes(searchTerm);
    });
  }, [technicianTypes, values.types_of_technician]);

  // ============================================================
  // HANDLE SUBMIT
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError("");

    const baseFieldsValid = values.FirstName.trim() && values.LastName.trim() && values.role;
    const emailValid = isEditMode ? true : values.email.trim();

    if (!baseFieldsValid || !emailValid) {
      setCustomError("Please fill in all required personnel fields.");
      return;
    }

    if (values.role === "Technician" && !values.types_of_technician.trim()) {
      setCustomError("Please select or enter the type of technician.");
      return;
    }

    if (!isEditMode) {
      if (!values.password || !values.confirmPassword) {
        setCustomError("Password and confirmation are required.");
        return;
      }
      if (values.password !== values.confirmPassword) {
        setCustomError("Credential passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        role: values.role,
        ...(values.role === "Technician" && {
          types_of_technician: values.types_of_technician.trim(),
        }),
        ...(!isEditMode && {
          email: values.email,
          password: values.password,
        }),
      };

      const result = isEditMode
        ? await UpdateUser(user._id, payload)
        : await AddUser(payload);

      if (result?.success) {
        if (isEditMode) {
          onUpdate(result.data);
        } else {
          onAddUser(result.data);
        }
        handleClose();
      } else {
        setCustomError(result?.error || "Unable to save user account.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      setCustomError(error.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      {/* MODAL CONTAINER */}
      <motion.div
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-visible shadow-2xl border-2 border-[#1e3a8a]"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* HEADER */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative rounded-t-[2.5rem]">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a]">
              {user ? <FaUserEdit size={24} /> : <FaUserPlus size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {user ? "Update" : "Personnel"}{" "}
                <span className="text-yellow-400">Account</span>
              </h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">
                User Access Management Terminal
              </p>
            </div>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {customError && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-black uppercase tracking-wider rounded-r-md">
              Error: {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* NAME FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-1">
                <label htmlFor="FirstName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                  <input
                    id="FirstName"
                    type="text"
                    name="FirstName"
                    value={values.FirstName}
                    onChange={handleInput}
                    placeholder="Enter First Name"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-1">
                <label htmlFor="Middle" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Middle Name
                </label>
                <input
                  id="Middle"
                  type="text"
                  name="Middle"
                  value={values.Middle}
                  onChange={handleInput}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                />
              </div>
            </div>

            {/* LAST NAME */}
            <div className="space-y-1">
              <label htmlFor="LastName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="LastName"
                type="text"
                name="LastName"
                value={values.LastName}
                onChange={handleInput}
                placeholder="Enter Surname"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
              />
            </div>

            {/* EMAIL & ROLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email Address {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleInput}
                    placeholder="email@company.com"
                    required={!isEditMode}
                    disabled={isEditMode}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none font-bold text-sm transition-all ${
                      isEditMode
                        ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] text-slate-700"
                    }`}
                  />
                </div>
                {isEditMode && (
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 ml-1">
                    Email cannot be changed.
                  </p>
                )}
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Access Level <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer hover:border-blue-400 transition-all"
                >
                  <span className={`text-sm font-bold ${values.role ? "text-slate-700" : "text-slate-400"}`}>
                    {getRoleLabel(values.role)}
                  </span>
                  {dropdownOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-slate-300" />}
                </div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      /* ✅ ROLE DROPDOWN: TAAS ANG Z-INDEX */
                      className="absolute z-[140] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden border-t-4 border-t-yellow-400"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <div
                          key={role.value}
                          onClick={() => handleRoleSelect(role.value)}
                          className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          {role.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ✅ PROFESSIONAL TYPE OF TECHNICIAN COMBOBOX */}
            <AnimatePresence>
              {values.role === "Technician" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-visible"
                >
                  <div className="space-y-1 pt-2 relative" ref={techTypeRef}>
                    <label htmlFor="types_of_technician" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Type of Technician <span className="text-red-500">*</span>
                    </label>

                    {/* Input Field acting as Search & Display */}
                    <div className="relative group">
                      <FaWrench className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a] transition-colors" />
                      <input
                        id="types_of_technician"
                        type="text"
                        name="types_of_technician"
                        value={values.types_of_technician}
                        onChange={(e) => {
                          handleInput(e);
                          setIsTechTypeOpen(true);
                        }}
                        onFocus={() => setIsTechTypeOpen(true)}
                        placeholder="Type or select specialization..."
                        required
                        autoComplete="off"
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setIsTechTypeOpen(!isTechTypeOpen)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] transition-colors p-1"
                      >
                        {isTechTypeOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                      </button>
                    </div>

                    {/* ✅ Professional Dropdown List — TAAS ANG Z-INDEX */}
                    <AnimatePresence>
                      {isTechTypeOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-[150] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden border-t-4 border-t-[#1e3a8a] max-h-60"
                        >
                          <div className="overflow-y-auto custom-scrollbar max-h-60">
                            {filteredTechTypes.length > 0 ? (
                              filteredTechTypes.map((typeObj, index) => {
                                const isSelected = values.types_of_technician === typeObj.types_of_technician;
                                return (
                                  <div
                                    key={index}
                                    onClick={() => handleTechTypeSelect(typeObj.types_of_technician)}
                                    className={`px-4 py-3 text-sm font-semibold cursor-pointer transition-all flex items-center justify-between border-b border-slate-50 last:border-0 ${
                                      isSelected
                                        ? "bg-[#1e3a8a] text-white"
                                        : "text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a]"
                                    }`}
                                  >
                                    <span>{typeObj.types_of_technician}</span>
                                    {isSelected && <FaCheck size={14} />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-4 text-sm text-slate-400 text-center font-semibold">
                                {values.types_of_technician
                                  ? "No matching types found. You can type a custom one."
                                  : "No technician types available. Please type a custom one."}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-[10px] text-slate-400 font-semibold ml-1 flex items-center gap-1">
                      <FaWrench size={10} /> Start typing to filter available specializations.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PASSWORD FIELDS - ADD MODE ONLY */}
            {!isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleInput}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1e3a8a] transition-colors focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleInput}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1e3a8a] transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3 mt-4 ${
                isLoading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? (
                "Update Account"
              ) : (
                "Deploy Personnel"
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="bg-yellow-400 py-2 text-center rounded-b-[2.5rem]">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.3em]">
            Authorized Information Entry
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUpForm;