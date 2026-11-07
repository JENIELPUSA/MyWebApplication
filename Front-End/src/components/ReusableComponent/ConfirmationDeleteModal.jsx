import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, Trash2, X, Info } from "lucide-react";

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

  const animationStyles = `
    @keyframes cdm-fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cdm-scaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes cdm-fadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes cdm-scaleOut {
      from { opacity: 1; transform: scale(1) translateY(0); }
      to { opacity: 0; transform: scale(0.95) translateY(4px); }
    }
    .cdm-backdrop-enter { animation: cdm-fadeIn 0.2s ease-out forwards; }
    .cdm-backdrop-exit  { animation: cdm-fadeOut 0.18s ease-in forwards; }
    .cdm-card-enter     { animation: cdm-scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .cdm-card-exit      { animation: cdm-scaleOut 0.18s ease-in forwards; }
  `;

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => cancelBtnRef.current?.focus(), 100);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) handleCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  const handleCancel = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 180);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) handleCancel();
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
          bg-slate-950/60 backdrop-blur-sm
          ${isClosing ? "cdm-backdrop-exit" : "cdm-backdrop-enter"}`}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cdm-title"
        aria-describedby="cdm-description"
      >
        <div
          ref={modalRef}
          className={`relative w-full max-w-[460px] rounded-xl overflow-hidden
            bg-white dark:bg-slate-900
            shadow-2xl
            ring-1 ring-slate-200 dark:ring-slate-800
            ${isClosing ? "cdm-card-exit" : "cdm-card-enter"}`}
        >
          {/* ── HEADER ───────────────────────────────── */}
          <div className="flex items-start gap-3.5 px-6 pt-6 pb-4">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full
              bg-blue-50 dark:bg-blue-950/40
              ring-1 ring-blue-100 dark:ring-blue-900/40">
              <AlertTriangle
                size={18}
                className="text-blue-600 dark:text-blue-400"
                strokeWidth={2.4}
              />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                id="cdm-title"
                className="text-base font-semibold text-slate-900 dark:text-white leading-tight"
              >
                {title}
              </h3>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>

            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-md
                text-slate-400 hover:text-slate-600 hover:bg-slate-100
                dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800
                transition-colors disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── NOTIFICATION MESSAGE ─────────────────── */}
          <div className="px-6 pb-4">
            <div
              id="cdm-description"
              className="flex items-start gap-2.5 rounded-lg
                bg-slate-50 dark:bg-slate-800/50
                border border-slate-200 dark:border-slate-700/60
                px-3.5 py-3"
            >
              <Info
                size={14}
                className="flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500"
                strokeWidth={2.2}
              />
              <p className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                Please review the details below before confirming. This action
                cannot be reversed once completed.
              </p>
            </div>
          </div>

          {/* ── ITEM DETAIL CARD (walang ID/Code) ───── */}
          {itemDetails && (
            <div className="px-6 pb-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/60
                bg-slate-50/50 dark:bg-slate-800/30 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-md
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    flex items-center justify-center">
                    {ItemIcon ? (
                      <ItemIcon size={16} className="text-slate-600 dark:text-slate-400" />
                    ) : (
                      <Trash2 size={16} className="text-slate-600 dark:text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {itemDetails.brand && (
                      <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                        {itemDetails.brand}
                      </p>
                    )}

                    {itemDetails.specification && (
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
                        {itemDetails.specification}
                      </p>
                    )}

                    {itemDetails.serialNumber && (
                      <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                        SN: {itemDetails.serialNumber}
                      </p>
                    )}

                    {itemDetails.extra && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {itemDetails.extra}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FOOTER / ACTIONS ─────────────────────── */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/50
            border-t border-slate-200 dark:border-slate-800
            flex flex-col-reverse sm:flex-row sm:justify-end gap-2">

            <button
              ref={cancelBtnRef}
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-[13px] font-medium
                text-slate-700 dark:text-slate-200
                bg-white dark:bg-slate-800
                border border-slate-300 dark:border-slate-700
                rounded-lg
                hover:bg-slate-50 dark:hover:bg-slate-700
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-slate-400 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-900
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            <button
              onClick={handleConfirmClick}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-[13px] font-medium
                text-white
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-blue-500 dark:focus:ring-offset-slate-900
                transition-all disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Deleting…</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
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