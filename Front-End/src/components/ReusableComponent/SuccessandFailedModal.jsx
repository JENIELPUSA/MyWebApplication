import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function StatusModal({
  isOpen = false,
  onClose,
  onSubmit, // optional — called when user confirms
  onCancel, // optional — called when user cancels (falls back to onClose)
  status = "success", // "success" | "error" | "warning" | "info"
  error = null,
  title = null,
  message = null,
  isProduction = false,
  submitText = null, // primary button text
  cancelText = "Cancel", // secondary button text
  showCancel = true, // show/hide secondary button
  showButton = true, // show/hide action buttons
  loading = false, // disables buttons + shows spinner
}) {
  const isSuccess = status === "success";
  const isError = status === "error";
  const isWarning = status === "warning";
  const isInfo = status === "info";

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        (onCancel || onClose)?.();
      }
    },
    [isOpen, onClose, onCancel, loading]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isOpen, handleKeyDown]);

  // Safe Error Parser
  const getSafeErrorMessage = () => {
    if (!error) return null;
    if (isProduction)
      return "An unexpected system error occurred. Please try again later.";
    return typeof error === "object"
      ? error.message || JSON.stringify(error)
      : error;
  };

  const safeError = getSafeErrorMessage();

  // Default Content
  const defaultTitle = isSuccess
    ? "Success!"
    : isError
    ? "Error"
    : isWarning
    ? "Warning"
    : "Notice";

  const defaultMessage = isSuccess
    ? "Your request has been successfully processed."
    : isError
    ? "There was a problem processing your request."
    : isWarning
    ? "Please review the details before proceeding."
    : "Here's an update for you.";

  const defaultSubmitText = isSuccess
    ? "Continue"
    : isError
    ? "Try Again"
    : isWarning
    ? "Proceed"
    : "Got it";

  // ==========================================
  // THEME
  // ==========================================
  const theme = {
    success: {
      icon: <CheckCircle2 className="w-7 h-7" strokeWidth={2.4} />,
      accentBar: "bg-[#0038A8]",
      iconBg:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      title: "text-blue-900 dark:text-blue-100",
      message: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      submit:
        "bg-[#0038A8] hover:bg-[#002d85] text-white shadow-blue-900/20",
      cancel:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
    },
    error: {
      icon: <AlertOctagon className="w-7 h-7" strokeWidth={2.4} />,
      accentBar: "bg-red-600",
      iconBg:
        "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
      title: "text-red-900 dark:text-red-200",
      message: "text-blue-900 dark:text-blue-200",
      border: "border-red-300 dark:border-red-700",
      submit: "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20",
      cancel:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7" strokeWidth={2.4} />,
      accentBar: "bg-[#0050D8]",
      iconBg:
        "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
      title: "text-blue-900 dark:text-blue-100",
      message: "text-blue-600 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      submit:
        "bg-[#0050D8] hover:bg-[#0046b8] text-white shadow-blue-900/20",
      cancel:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
    },
    info: {
      icon: <Info className="w-7 h-7" strokeWidth={2.4} />,
      accentBar: "bg-[#4A90E2]",
      iconBg:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
      title: "text-blue-900 dark:text-blue-100",
      message: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      submit:
        "bg-[#4A90E2] hover:bg-[#3a7fd5] text-white shadow-blue-900/20",
      cancel:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
    },
  };

  const currentTheme = theme[status] || theme.info;

  const resolvedMessage =
    message || (isError ? safeError : null) || defaultMessage;

  const showErrorDetails =
    isError && safeError && safeError !== resolvedMessage;

  // Modal animation
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 24, stiffness: 320 },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      y: 20,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (loading) return;
    if (onSubmit) onSubmit();
    else onClose?.();
  };

  const handleCancel = () => {
    if (loading) return;
    (onCancel || onClose)?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCancel}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
          />

          {/* Modal — FORM STYLE */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
            aria-describedby="status-modal-desc"
            className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 overflow-hidden dark:bg-slate-900 ${
              isError
                ? "border-red-300 dark:border-red-700"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {/* Header — Form-style colored banner */}
            <div
              className={`${currentTheme.accentBar} px-6 py-4 flex items-center gap-3 text-white`}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {currentTheme.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  id="status-modal-title"
                  className="text-sm font-black uppercase tracking-widest leading-tight"
                >
                  {title || defaultTitle}
                </h4>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                  {isSuccess ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : isError ? (
                    <ShieldAlert className="w-3 h-3" />
                  ) : null}
                  {isSuccess
                    ? "Operation Completed"
                    : isError
                    ? "Operation Failed"
                    : isWarning
                    ? "Action Required"
                    : "System Notice"}
                </p>
              </div>

              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                onClick={handleCancel}
                disabled={loading}
                className="shrink-0 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="p-6 space-y-4">
                {/* Message */}
                <p
                  id="status-modal-desc"
                  className={`text-sm leading-relaxed ${currentTheme.message}`}
                >
                  {resolvedMessage}
                </p>

                {/* Error details */}
                {showErrorDetails && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800">
                    <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
                      Error Details
                    </p>
                    <code className="text-[11px] text-blue-800 dark:text-blue-300 font-mono break-words leading-tight block">
                      {safeError}
                    </code>
                  </div>
                )}
              </div>

              {/* Form footer — action buttons */}
              {showButton && (
                <div className="px-6 pb-5 pt-2 flex flex-col-reverse sm:flex-row gap-2">
                  {showCancel && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.cancel}`}
                    >
                      {cancelText}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme.submit}`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      submitText || defaultSubmitText
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}