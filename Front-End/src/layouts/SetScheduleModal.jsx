// SetScheduleModal.jsx
import { useState, useEffect } from "react";
import { Calendar, X, Loader2, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

export const SetScheduleModal = ({
  open,
  onClose,
  onConfirm,
  title = "Set Schedule",
  description = "Please select the scheduled date and time before confirming.",
  confirmLabel = "Confirm & Approve",
  isSubmitting = false,
  initialValue = "",
}) => {
  const [dateValue, setDateValue] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDateValue(initialValue || "");
      setError("");
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleConfirm = () => {
    if (!dateValue || String(dateValue).trim() === "") {
      setError("Please select a schedule date.");
      return;
    }

    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) {
      setError("Invalid date. Please pick a valid schedule.");
      return;
    }

    setError("");
    onConfirm?.(parsed);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Calendar size={19} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-5 space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Schedule Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => {
              setDateValue(e.target.value);
              if (error) setError("");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Calendar size={16} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

SetScheduleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  isSubmitting: PropTypes.bool,
  initialValue: PropTypes.string,
};