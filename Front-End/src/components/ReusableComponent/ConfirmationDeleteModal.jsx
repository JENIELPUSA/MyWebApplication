import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, Trash2, X } from "lucide-react";

/**
 * ✅ Reusable Bipsu-Themed Delete Confirmation Modal
 * 
 * @param {boolean}  isOpen          - Controls visibility
 * @param {function} onClose         - Called when user cancels/closes
 * @param {function} onConfirm       - Called when user confirms (can be async)
 * @param {boolean}  isLoading       - Shows loading state on confirm button
 * @param {string}   title           - Modal title (default: "Delete Item?")
 * @param {string}   description     - Modal description
 * @param {string}   confirmText     - Confirm button text (default: "Yes, Delete")
 * @param {string}   cancelText      - Cancel button text (default: "Cancel")
 * @param {object}   itemDetails     - { code, brand, specification, serialNumber, ... }
 * @param {string}   itemIcon        - Optional icon component for the detail card
 */
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Delete Item?",
  description = "This action cannot be undone. The item will be permanently removed.",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  itemDetails = null,
  itemIcon: ItemIcon = null,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // ==========================================
  // ✅ ANIMATIONS (kept inside component)
  // ==========================================
  const animationStyles = `
    @keyframes cdm-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes cdm-scaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes cdm-fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes cdm-scaleOut {
      from { opacity: 1; transform: scale(1) translateY(0); }
      to { opacity: 0; transform: scale(0.95) translateY(4px); }
    }
    @keyframes cdm-iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    .cdm-backdrop-enter { animation: cdm-fadeIn 0.2s ease-out forwards; }
    .cdm-backdrop-exit  { animation: cdm-fadeOut 0.18s ease-in forwards; }
    .cdm-card-enter     { animation: cdm-scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .cdm-card-exit      { animation: cdm-scaleOut 0.18s ease-in forwards; }
    .cdm-icon-pulse     { animation: cdm-iconPulse 1.8s ease-in-out infinite; }
  `;

  // ==========================================
  // ✅ ESC key + body lock + focus
  // ==========================================
  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => cancelBtnRef.current?.focus(), 100);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading]);

  // Reset closing state when opened
  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleCancel = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 180);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel();
    }
  };

  const handleConfirmClick = async () => {
    if (isLoading) return;
    await onConfirm?.();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{animationStyles}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4
          bg-blue-950/60 backdrop-blur-sm
          ${isClosing ? "cdm-backdrop-exit" : "cdm-backdrop-enter"}`}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cdm-title"
        aria-describedby="cdm-description"
      >
        <div
          ref={modalRef}
          className={`relative w-full max-w-[440px] rounded-2xl overflow-hidden
            bg-white dark:bg-slate-800
            shadow-[0_25px_60px_-15px_rgba(30,58,138,0.5)]
            ring-1 ring-blue-200 dark:ring-blue-900/50
            ${isClosing ? "cdm-card-exit" : "cdm-card-enter"}`}
        >
          {/* ── TOP ACCENT BAR — Bipsu Blue + Gold ─────── */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700" />

          {/* ── CLOSE (X) BUTTON ───────────────────────── */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="absolute top-3 right-3 p-1.5 rounded-full
              text-blue-400 hover:text-blue-700 hover:bg-blue-50
              dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700
              transition-colors disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* ── BODY ───────────────────────────────────── */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full
                  bg-gradient-to-br from-blue-50 to-blue-100
                  dark:from-blue-900/40 dark:to-blue-950/40
                  ring-8 ring-blue-50 dark:ring-blue-900/20
                  cdm-icon-pulse">
                  <AlertTriangle
                    size={30}
                    className="text-blue-700 dark:text-blue-400"
                    strokeWidth={2.2}
                  />
                </div>
              </div>

              <h3
                id="cdm-title"
                className="text-xl font-bold text-blue-900 dark:text-white tracking-tight"
              >
                {title}
              </h3>
              <p
                id="cdm-description"
                className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-[340px]"
              >
                {description}
              </p>
            </div>

            {/* ── ITEM DETAIL CARD (optional) ────────────── */}
            {itemDetails && (
              <div className="mt-5 rounded-xl border border-blue-200 dark:border-slate-700
                bg-gradient-to-br from-blue-50 to-white dark:from-slate-900/50 dark:to-slate-900/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg
                    bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700
                    flex items-center justify-center">
                    {ItemIcon ? (
                      <ItemIcon size={18} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Trash2 size={18} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {itemDetails.code && (
                        <span className="font-mono text-[11px] font-bold tracking-wide
                          text-blue-800 dark:text-blue-200
                          bg-amber-100 dark:bg-amber-900/40
                          border border-amber-300 dark:border-amber-700
                          px-2 py-0.5 rounded">
                          {itemDetails.code}
                        </span>
                      )}
                      {itemDetails.brand && (
                        <span className="text-sm font-semibold text-blue-900 dark:text-white truncate">
                          {itemDetails.brand}
                        </span>
                      )}
                    </div>

                    {itemDetails.specification && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {itemDetails.specification}
                      </p>
                    )}

                    {itemDetails.serialNumber && (
                      <p className="mt-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                        SN: {itemDetails.serialNumber}
                      </p>
                    )}

                    {/* Allow extra custom fields */}
                    {itemDetails.extra && (
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {itemDetails.extra}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── FOOTER / ACTIONS ───────────────────────── */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-amber-50
            dark:bg-slate-900/60 dark:from-slate-900/60 dark:to-slate-900/60
            border-t border-blue-100 dark:border-slate-700
            flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">

            <button
              ref={cancelBtnRef}
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold
                text-blue-700 dark:text-slate-200
                bg-white dark:bg-slate-800
                border border-blue-300 dark:border-slate-600
                rounded-lg
                hover:bg-blue-50 dark:hover:bg-slate-700
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-blue-500 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-800
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            <button
              onClick={handleConfirmClick}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold
                text-white
                bg-gradient-to-b from-blue-700 to-blue-800
                hover:from-blue-800 hover:to-blue-900
                active:from-blue-900 active:to-blue-950
                rounded-lg shadow-sm shadow-blue-500/30
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-blue-500 dark:focus:ring-offset-slate-800
                transition-all disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Deleting…</span>
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeleteModal;