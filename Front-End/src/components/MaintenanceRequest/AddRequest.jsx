import React, { useState, useContext, useMemo, useEffect } from "react";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";
import { ProblemContext } from "../../contexts/ProblemContext/ProblemContext";
import { AuthContext } from "../../contexts/AuthContext";
import { StatisticsContext } from "../../contexts/StatisticContext/statisticalContext.jsx";

//  Helper: format today's date as MM/DD/YYYY
const getTodayDate = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

function AddRequest({
  DepartmentID,
  EquipmentID,
  LaboratoryID,
  description,
  onClose,
  isOpen,
  onAddRequest,
}) {
  const { problems, displayProblems } = useContext(ProblemContext);
  const { addDescription, customError } = useContext(MaintenanceRequestContext);
  const { first_name, last_name, email } = useContext(AuthContext);
  const { inchargeStats } = useContext(StatisticsContext);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);

  //  Declaration confirmation state
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [declarationError, setDeclarationError] = useState("");

  //  Auto-compose full name from AuthContext
  const fullName = useMemo(() => {
    const parts = [first_name, last_name].filter(Boolean);
    return parts.join(" ").trim();
  }, [first_name, last_name]);

  //  Get LaboratoryName + DepartmentName from inchargeStats
  const locationAreas = useMemo(() => {
    const stats = inchargeStats?.statistics?.[0];
    if (!stats) return "";
    const lab = stats.LaboratoryName?.trim() || "";
    const dept = stats.department?.DepartmentName?.trim() || "";
    if (lab && dept) return `${lab} - ${dept}`;
    if (lab) return lab;
    if (dept) return dept;
    return "";
  }, [inchargeStats]);

  const [values, setValues] = useState({
    Description: description || "",
    Category: "",
    ProblemId: null,

    DepartmentHead: "",
    ContactPerson: fullName,
    ContactEmail: email || "",
    ContactPhone: "",
    location_areas: locationAreas,
    type_works: "",
    Printed_name_requestor: fullName,
    DateRequested: getTodayDate(),
    isConfirmed: false,
  });

  //  Load problems when modal opens
  useEffect(() => {
    if (isOpen && typeof displayProblems === "function") {
      displayProblems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  //  Sync AuthContext → read-only fields
  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      ContactPerson: fullName || prev.ContactPerson,
      ContactEmail: email || prev.ContactEmail,
      Printed_name_requestor: fullName || prev.Printed_name_requestor,
    }));
  }, [fullName, email]);

  //  Sync late-hydrated location_areas
  useEffect(() => {
    if (locationAreas) {
      setValues((prev) => ({ ...prev, location_areas: locationAreas }));
    }
  }, [locationAreas]);

  // Unique categories from problems
  const categories = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    const uniqueCategories = [...new Set(problems.map((p) => p.category))];
    return uniqueCategories.sort();
  }, [problems]);

  // Filtered problems by category
  const filteredProblems = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    if (!selectedCategory) return [];
    return problems.filter((p) => p.category === selectedCategory);
  }, [problems, selectedCategory]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory("");
      setSelectedProblem(null);
      setDeclarationConfirmed(false);
      setDeclarationError("");
      setValues({
        Description: description || "",
        Category: "",
        ProblemId: null,

        DepartmentHead: "",
        ContactPerson: fullName,
        ContactEmail: email || "",
        ContactPhone: "",
        location_areas: locationAreas,
        type_works: "",
        Printed_name_requestor: fullName,
        DateRequested: getTodayDate(),
        isConfirmed: false,
      });
    }
  }, [isOpen, description, fullName, email, locationAreas]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  //  String / name characters only handler (blocks numbers & symbols)
  const handleStringOnly = (event) => {
    const { name, value } = event.target;
    const stringValue = value.replace(/[^a-zA-Z\s.'-]/g, "");
    setValues((prev) => ({ ...prev, [name]: stringValue }));
  };

  //  Number-only handler
  const handleNumberOnly = (event) => {
    const { name, value } = event.target;
    const numericValue = value.replace(/\D/g, "");
    setValues((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setValues((prev) => ({ ...prev, Category: category, ProblemId: null }));
    setSelectedProblem(null);
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setValues((prev) => ({
      ...prev,
      ProblemId: problem._id,
      Description: problem.title,
    }));
  };

  const isValidEmail = (email) => {
    if (!email) return true;
    return /^\S+@\S+\.\S+$/.test(email);
  };

  //  Declaration checkbox handler
  const handleDeclarationChange = (e) => {
    const checked = e.target.checked;
    setDeclarationConfirmed(checked);
    setValues((prev) => ({ ...prev, isConfirmed: checked }));
    if (checked) setDeclarationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.Description?.trim()) {
      alert("Please provide a description of the issue.");
      return;
    }

    if (values.ContactEmail && !isValidEmail(values.ContactEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!declarationConfirmed || !values.isConfirmed) {
      setDeclarationError(
        "You must confirm the declaration before submitting."
      );
      return;
    }
    setDeclarationError("");

    setIsLoading(true);

    try {
      const result = await addDescription({
        Description: values.Description,
        Equipments: EquipmentID,
        Department: DepartmentID,
        Laboratory: LaboratoryID,
        DepartmentHead: values.DepartmentHead,
        ContactPerson: fullName,
        ContactEmail: email || "",
        ContactPhone: values.ContactPhone,
        location_areas: locationAreas,
        type_works: values.type_works,
        Printed_name_requestor: fullName,
        DateRequested: values.DateRequested,
        isConfirmed: values.isConfirmed,
      });

      if (result?.success === true) {
        if (onAddRequest) onAddRequest(result.data);
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-poppins">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto font-poppins">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white sticky top-0 z-10">
          <button
            onClick={handleClose}
            className="absolute top-3 right-4 text-white/70 hover:text-white"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold">
            {description ? "Modify" : "New"} Work Order Request
          </h2>
          <p className="text-sm text-blue-100">
            Fill out the form below to submit a maintenance or repair request
          </p>
        </div>

        <div className="p-6">
          {customError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-400 text-red-700 text-sm rounded">
              ⚠ {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-poppins">
            {/* Signatory / Contact section */}
            <div className="border border-gray-200 rounded">
              <div className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-t">
                Signatory & Contact Info
              </div>

              <div className="px-3 pb-3 space-y-3 pt-3">
                {/* Department Head — STRING / LETTERS ONLY */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department Head{" "}
                    <span className="text-gray-400">(letters only)</span>
                  </label>
                  <input
                    type="text"
                    name="DepartmentHead"
                    value={values.DepartmentHead}
                    onChange={handleStringOnly}
                    inputMode="text"
                    placeholder="e.g. Dr. Juan Dela Cruz"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Contact Person — READ-ONLY */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Person{" "}
                    <span className="text-gray-400">(from account)</span>
                  </label>
                  <input
                    type="text"
                    name="ContactPerson"
                    value={values.ContactPerson}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-poppins bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Contact Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Contact Email — READ-ONLY */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contact Email{" "}
                      <span className="text-gray-400">(from account)</span>
                    </label>
                    <input
                      type="email"
                      name="ContactEmail"
                      value={values.ContactEmail}
                      readOnly
                      disabled
                      placeholder="No email on account"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-poppins bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Contact Phone — NUMBER ONLY */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contact Phone{" "}
                      <span className="text-gray-400">(numbers only)</span>
                    </label>
                    <input
                      type="tel"
                      name="ContactPhone"
                      value={values.ContactPhone}
                      onChange={handleNumberOnly}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={13}
                      placeholder="e.g. 09171234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Digits only — letters and symbols are blocked.
                    </p>
                  </div>
                </div>

                {/* Location / Area — READ-ONLY */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location / Area{" "}
                    <span className="text-gray-400">(from assignment)</span>
                  </label>
                  <input
                    type="text"
                    name="location_areas"
                    value={values.location_areas}
                    readOnly
                    disabled
                    placeholder="No laboratory assigned"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-poppins bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Type of Works */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type of Work
                  </label>
                  <select
                    name="type_works"
                    value={values.type_works}
                    onChange={handleInput}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type of work...</option>

                    <optgroup label="Appliance Repair and Maintenance">
                      <option value="TV Technician">TV Technician</option>
                      <option value="Aircon Technician">Aircon Technician</option>
                      <option value="Electric Fan Technician">Electric Fan Technician</option>
                      <option value="Water Dispenser Technician">Water Dispenser Technician</option>
                      <option value="Refrigerator Technician">Refrigerator Technician</option>
                      <option value="Washing Machine Technician">Washing Machine Technician</option>
                      <option value="Microwave Technician">Microwave Technician</option>
                    </optgroup>

                    <optgroup label="Computer and IT Services">
                      <option value="Laptop Technician">Laptop Technician</option>
                      <option value="Desktop Computer Technician">Desktop Computer Technician</option>
                      <option value="Printer Technician">Printer Technician</option>
                      <option value="Network Technician">Network Technician</option>
                      <option value="CCTV Technician">CCTV Technician</option>
                    </optgroup>

                    <optgroup label="Electrical Services">
                      <option value="Electrician">Electrician</option>
                      <option value="Electrical Installation">Electrical Installation</option>
                      <option value="Electrical Maintenance">Electrical Maintenance</option>
                      <option value="Wiring Technician">Wiring Technician</option>
                    </optgroup>

                    <optgroup label="General Technical Services">
                      <option value="General Appliance Repair">General Appliance Repair</option>
                      <option value="Preventive Maintenance">Preventive Maintenance</option>
                      <option value="Installation">Installation</option>
                      <option value="Troubleshooting">Troubleshooting</option>
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>

                {/*  Category Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No categories available.
                    </p>
                  )}
                </div>

                {/*  Problem Selection */}
                {selectedCategory && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Problem
                    </label>
                    <select
                      value={selectedProblem?._id || ""}
                      onChange={(e) => {
                        const problem = filteredProblems.find(
                          (p) => p._id === e.target.value
                        );
                        if (problem) handleProblemSelect(problem);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a problem...</option>
                      {filteredProblems.map((problem) => (
                        <option key={problem._id} value={problem._id}>
                          {problem.title}
                        </option>
                      ))}
                    </select>
                    {filteredProblems.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No problems in this category.
                      </p>
                    )}
                  </div>
                )}

                {/* Job Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="Description"
                    value={values.Description}
                    onChange={handleInput}
                    rows="4"
                    placeholder="Please describe the work to be done in detail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                  {selectedProblem && (
                    <p className="text-xs text-blue-600 mt-1">
                      Auto-filled from selected problem. You can edit manually.
                    </p>
                  )}
                </div>

                {/*  Selected Problem Preview */}
                {selectedProblem && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-semibold text-blue-700">
                      Selected Problem
                    </p>
                    <p className="font-medium text-gray-800">
                      {selectedProblem.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Category: {selectedProblem.category}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/*  Declaration Box */}
            <div
              className={`border rounded p-4 ${
                declarationError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Declaration
              </p>

              {/* Printed Name of Requestor */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Printed Name (Requestor){" "}
                  <span className="text-gray-400">(from account)</span>
                </label>
                <input
                  type="text"
                  name="Printed_name_requestor"
                  value={values.Printed_name_requestor}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-poppins bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Date of Requested */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Requested{" "}
                  <span className="text-gray-400">(auto · today)</span>
                </label>
                <input
                  type="text"
                  name="DateRequested"
                  value={values.DateRequested}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-poppins bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Declaration Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationConfirmed}
                  onChange={handleDeclarationChange}
                  className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  <strong>Declaration & Confirmation:</strong> I hereby certify that the information provided in this Work Order Request Form is true and correct. I understand that this request will be reviewed by the administrator and forwarded to the appropriate personnel for action.
                </span>
              </label>

              {declarationError && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠ {declarationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !values.Description?.trim() ||
                !declarationConfirmed
              }
              className={`w-full py-2.5 px-4 rounded font-medium font-poppins text-white transition ${
                isLoading ||
                !values.Description?.trim() ||
                !declarationConfirmed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Submitting..."
                : description
                  ? "Update Request"
                  : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRequest;