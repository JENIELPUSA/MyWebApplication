import React, { useState, useContext, useMemo } from "react";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";
import { ProblemContext } from "../../contexts/ProblemContext/ProblemContext";

function AddRequest({
  DepartmentID,
  EquipmentID,
  LaboratoryID,
  description,
  onClose,
  isOpen,
  onAddRequest,
}) {
  const { problems } = useContext(ProblemContext);
  const { addDescription, customError } = useContext(MaintenanceRequestContext);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [values, setValues] = useState({
    Description: description || "",
    Category: "",
    ProblemId: null
  });

  // Get unique categories from problems
  const categories = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    const uniqueCategories = [...new Set(problems.map(p => p.category))];
    return uniqueCategories.sort();
  }, [problems]);

  // Filter problems based on selected category
  const filteredProblems = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    if (!selectedCategory) return [];
    return problems.filter(p => p.category === selectedCategory);
  }, [problems, selectedCategory]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCategory("");
      setSelectedProblem(null);
      setValues({
        Description: description || "",
        Category: "",
        ProblemId: null
      });
    }
  }, [isOpen, description]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setValues(prev => ({ ...prev, Category: category, ProblemId: null }));
    setSelectedProblem(null);
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setValues(prev => ({
      ...prev,
      ProblemId: problem._id,
      Description: problem.title
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.Description?.trim()) {
      alert("Please provide a description of the issue.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await addDescription(
        values.Description,
        EquipmentID,
        LaboratoryID,
        DepartmentID,
        values.ProblemId || null
      );

      if (result?.success === true) {
        if (onAddRequest) {
          onAddRequest(result.data);
        }
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white sticky top-0 z-10">
          <button
            onClick={handleClose}
            className="absolute top-3 right-4 text-white/70 hover:text-white"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold">
            {description ? "Modify" : "New"} Request
          </h2>
          <p className="text-sm text-blue-100">Maintenance Request Form</p>
        </div>

        <div className="p-6">
          {customError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-400 text-red-700 text-sm rounded">
              ⚠ {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No categories available.</p>
              )}
            </div>

            {/* Problem Selection */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Problem <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  value={selectedProblem?._id || ""}
                  onChange={(e) => {
                    const problem = filteredProblems.find(p => p._id === e.target.value);
                    if (problem) handleProblemSelect(problem);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a problem...</option>
                  {filteredProblems.map((problem) => (
                    <option key={problem._id} value={problem._id}>
                      {problem.title}
                    </option>
                  ))}
                </select>
                {filteredProblems.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No problems in this category.</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="Description"
                value={values.Description}
                onChange={handleInput}
                rows="4"
                placeholder="Describe the specific issue or required service..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
              {selectedProblem && (
                <p className="text-xs text-blue-600 mt-1">
                  Auto-filled from selected problem. You can edit manually.
                </p>
              )}
            </div>

            {/* Selected Problem Preview */}
            {selectedProblem && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs font-semibold text-blue-700">Selected Problem</p>
                <p className="font-medium text-gray-800">{selectedProblem.title}</p>
                <p className="text-xs text-gray-500">Category: {selectedProblem.category}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !values.Description?.trim()}
              className={`w-full py-2.5 px-4 rounded font-medium text-white transition
                ${
                  isLoading || !values.Description?.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isLoading ? "Submitting..." : description ? "Update Request" : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRequest;