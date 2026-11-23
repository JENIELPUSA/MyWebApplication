// src/components/PMSComponent/pdfs/PMS005PdfPage.jsx
import React from "react";
import { FileText, X, ChevronDown, Building2, AlertCircle } from "lucide-react";
import bispulogo from "../../../assets/bipsulogo.png";

// ============================================================
// PDF PAGE — PMS005 (PORTRAIT, 8 columns)
// ============================================================
export function PMS005PdfPage({
    pageItems = [],
    pageNumber = 1,
    totalPages = 1,
    officeName = "",
    signatures = { prepared: "", attested: "", approved: "" },
    emptyRowCount,
    minRows = 15,
    widthPx = 794,
    heightPx = 1123,
}) {
    const computedEmptyRows =
        typeof emptyRowCount === "number"
            ? emptyRowCount
            : Math.max(0, minRows - pageItems.length);

    return (
        <div
            className="pdf-page pdf-page-pms005 bg-white"
            style={{
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                minWidth: `${widthPx}px`,
                maxWidth: `${widthPx}px`,
                minHeight: `${heightPx}px`,
                maxHeight: `${heightPx}px`,
                padding: "45px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
            }}
        >
            {/* HEADER */}
            <header className="border border-black grid grid-cols-12 min-h-[110px]">
                <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                    <img
                        src={bispulogo}
                        alt="BiPSU Logo"
                        crossOrigin="anonymous"
                        className="w-[90px] h-[90px] object-contain mb-1"
                    />
                </div>
                <div className="col-span-6 border-r border-black flex flex-col">
                    <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                        <div className="text-[7px] leading-tight mb-0.5">Type:</div>
                        <div className="text-center text-[9px] font-bold leading-tight break-words">
                            QUALITY MANAGEMENT SYSTEM
                        </div>
                        <div className="text-center text-[9px] font-bold leading-tight break-words">
                            PERIODIC MAINTENANCE SYSTEM - FORM
                        </div>
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                        <div className="text-[7px] leading-tight mb-0.5">Title:</div>
                        <div className="text-center text-[9px] font-bold leading-tight break-words">
                            EQUIPMENT MAINTENANCE RECORD
                        </div>
                    </div>
                </div>
                <div className="col-span-3 flex flex-col text-[8px]">
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Document No.:</span>
                        <span className="block text-center font-bold text-[9px] leading-tight break-words">
                            BiPSU-QAA-PMS-005
                        </span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                        <span>Page:</span>
                        <span className="font-bold">
                            {pageNumber} of {totalPages}
                        </span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Effective Date:</span>
                        <span className="block text-center font-bold leading-tight">
                            October 09, 2020
                        </span>
                    </div>
                    <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Issuance/Revision:</span>
                        <span className="block text-center font-bold leading-tight">
                            02/01
                        </span>
                    </div>
                </div>
            </header>

            {/* SCHOOL/OFFICE */}
            <div className="mt-6 mb-3 flex items-center justify-center gap-1">
                <span className="text-[11px] font-bold">SCHOOL/OFFICE OF</span>
                <span
                    className="border-b border-black text-center font-bold text-[11px] px-2"
                    style={{
                        width: `${Math.max(
                            260,
                            (officeName?.length || 0) * 7 + 20
                        )}px`,
                        display: "inline-block",
                        paddingBottom: "4px",
                        minHeight: "16px",
                    }}
                >
                    {officeName || "\u00A0"}
                </span>
            </div>

            {/* TABLE — 8 columns */}
            <table className="w-full border-collapse border border-black table-fixed">
                <thead>
                    <tr className="text-[8px] font-bold text-center">
                        <th className="border border-black px-0.5 py-1 w-[10%]">
                            Code
                            <br />
                            No.
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[15%]">
                            Name of
                            <br />
                            Equip/Tools
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[10%]">
                            Period
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[16%]">
                            Spare Parts /
                            <br />
                            Materials
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[10%]">
                            Manhour
                            <br />
                            Used
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[16%]">
                            Problem
                            <br />
                            Encountered
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[15%]">
                            Tech / Lab
                            <br />
                            In-Charge
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[8%]">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pageItems.map((item, idx) => (
                        <tr
                            key={item.id || `row-${idx}`}
                            className="text-[8px] text-center h-[28px]"
                        >
                            <td className="border border-black px-0.5 py-0.5">
                                {item.codeNo || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5">
                                {item.name || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5">
                                {item.period || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5 break-words">
                                {item.Spare_Parts || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5">
                                {item.Man_hour_used || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5 break-words">
                                {item.Problem_Encounter || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5 break-words">
                                {item.Tech_InCharge || ""}
                            </td>
                            <td className="border border-black px-0.5 py-0.5">
                                {item.Date || ""}
                            </td>
                        </tr>
                    ))}

                    {Array.from({ length: computedEmptyRows }).map(
                        (_, index) => (
                            <tr key={`empty-${index}`} className="h-[28px]">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <td
                                        key={i}
                                        className="border border-black"
                                    />
                                ))}
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            {/* SIGNATURES */}
            <div className="mt-10 grid grid-cols-3 gap-8 text-[9px]">
                <div>
                    <div className="mb-8 font-medium">Prepared:</div>
                    <div className="border-b border-black text-center font-bold text-[9px] min-h-[20px]">
                        {signatures.prepared || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-8 font-medium">Attested:</div>
                    <div className="border-b border-black text-center font-bold text-[9px] min-h-[20px]">
                        {signatures.attested || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-8 font-medium">Approved:</div>
                    <div className="border-b border-black text-center font-bold text-[9px] min-h-[20px]">
                        {signatures.approved || "\u00A0"}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// VIEWER — PMS005 (mini card + full form)
// ============================================================
export function PMS005Viewer({
    allRows005 = [],
    officeName = "",
    performedBy = null,
    loading = false,
    error = null,
    miniExpanded = false,
    onOpenFull,
    onCloseFull,
    fullFormRef,
    totalPdfPages = 1,
    onRetry,
    signatures = { prepared: "", attested: "", approved: "" },
    onSignatureChange,
    minRows = 15,
}) {
    const A4P_HEIGHT = 1123;

    const performedByName = performedBy
        ? [performedBy.FirstName, performedBy.Middle, performedBy.LastName]
              .filter(Boolean)
              .join(" ") || performedBy.username || "N/A"
        : null;

    const emptyRowsForFullForm = Math.max(0, minRows - allRows005.length);

    return (
        <>
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-orange-600 text-white shadow-sm">
                        PMS005
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Equipment Maintenance Record (Portrait)
                    </span>
                    {performedByName && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Performed by: <strong>{performedByName}</strong>
                        </span>
                    )}
                </div>

                {error && (
                    <div className="w-full max-w-[500px] bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="w-full max-w-[500px] text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-500 mt-3">
                            Loading PMS005 records...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* MINI CARD */}
                        <div
                            onClick={miniExpanded ? onCloseFull : onOpenFull}
                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.99] ${
                                miniExpanded
                                    ? "ring-2 ring-orange-500 rounded-md"
                                    : ""
                            }`}
                            title={
                                miniExpanded
                                    ? "Click to close full form"
                                    : "Click to open PMS005 full form"
                            }
                        >
                            <div
                                className="bg-white border border-slate-300 shadow-lg"
                                style={{
                                    width: "300px",
                                    height: "380px",
                                    padding: "14px",
                                    transform: miniExpanded
                                        ? "rotate(0deg)"
                                        : "rotate(-1deg)",
                                }}
                            >
                                <div className="border border-black grid grid-cols-12 h-[52px] mb-1.5">
                                    <div className="col-span-3 border-r border-black flex items-center justify-center">
                                        <img
                                            src={bispulogo}
                                            alt="logo"
                                            className="w-9 h-9 object-contain"
                                        />
                                    </div>
                                    <div className="col-span-6 border-r border-black flex flex-col justify-center px-0.5">
                                        <div className="text-[4px] font-bold text-center leading-tight">
                                            QUALITY MANAGEMENT SYSTEM
                                        </div>
                                        <div className="text-[4px] font-bold text-center leading-tight">
                                            PERIODIC MAINTENANCE SYSTEM - FORM
                                        </div>
                                        <div className="text-[4px] font-bold text-center leading-tight mt-0.5">
                                            EQUIPMENT MAINTENANCE RECORD
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex flex-col text-[3.5px] px-0.5">
                                        <div className="border-b border-black flex-1 flex items-center justify-center font-bold">
                                            BiPSU-QAA-PMS-005
                                        </div>
                                        <div className="border-b border-black flex-1 flex items-center justify-center">
                                            Page: 1 of {totalPdfPages}
                                        </div>
                                        <div className="border-b border-black flex-1 flex items-center justify-center">
                                            October 09, 2020
                                        </div>
                                        <div className="flex-1 flex items-center justify-center font-bold">
                                            02/01
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[5px] text-center font-bold mb-1.5 truncate">
                                    SCHOOL/OFFICE OF{" "}
                                    <span className="border-b border-black inline-block px-0.5">
                                        {officeName || "—"}
                                    </span>
                                </div>

                                <div className="border border-black">
                                    <div className="grid grid-cols-8 h-[14px] border-b border-black bg-slate-100">
                                        {[
                                            "Code",
                                            "Name",
                                            "Per",
                                            "Spare",
                                            "MH",
                                            "Prob",
                                            "Tech",
                                            "Date",
                                        ].map((h, i) => (
                                            <div
                                                key={i}
                                                className="border-r border-black last:border-r-0 text-[3px] font-bold flex items-center justify-center text-center"
                                            >
                                                {h}
                                            </div>
                                        ))}
                                    </div>
                                    {Array.from({ length: 12 }).map(
                                        (_, rowIdx) => (
                                            <div
                                                key={rowIdx}
                                                className="grid grid-cols-8 h-[14px] border-b border-black last:border-b-0"
                                            >
                                                {Array.from({
                                                    length: 8,
                                                }).map((_, colIdx) => (
                                                    <div
                                                        key={colIdx}
                                                        className="border-r border-black last:border-r-0"
                                                    />
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-1.5 mt-3">
                                    {[
                                        "Prepared",
                                        "Attested",
                                        "Approved",
                                    ].map((label) => (
                                        <div
                                            key={label}
                                            className="text-center"
                                        >
                                            <div className="text-[3.5px] mb-1.5">
                                                {label}:
                                            </div>
                                            <div className="border-b border-black h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={
                                miniExpanded ? onCloseFull : onOpenFull
                            }
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                            {miniExpanded ? (
                                <>
                                    <X className="w-3.5 h-3.5" />
                                    Close PMS005 form
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    Open PMS005 form
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* FULL FORM */}
            {miniExpanded && (
                <div
                    ref={fullFormRef}
                    className="flex flex-col items-center gap-3 animate-fade-in-scale"
                >
                    <div className="flex items-center gap-2 w-[794px] max-w-full">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-orange-600 text-white shadow-sm">
                            PMS005
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Full Form — {officeName || "PMS"} (
                            {allRows005.length} rows, {totalPdfPages} page
                            {totalPdfPages > 1 ? "s" : ""})
                        </span>
                        <button
                            type="button"
                            onClick={onCloseFull}
                            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                            title="Close full form"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div
                        className="bg-white w-[794px] max-w-full p-[45px] border border-slate-400 shadow-xl text-black flex flex-col"
                        style={{ minHeight: `${A4P_HEIGHT}px` }}
                    >
                        <header className="border border-black grid grid-cols-12 min-h-[110px] shrink-0">
                            <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                                <img
                                    src={bispulogo}
                                    alt="BiPSU Logo"
                                    crossOrigin="anonymous"
                                    className="w-[90px] h-[90px] object-contain mb-1"
                                />
                            </div>
                            <div className="col-span-6 border-r border-black flex flex-col">
                                <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                                    <div className="text-[7px] leading-tight mb-0.5">
                                        Type:
                                    </div>
                                    <div className="text-center text-[9px] font-bold leading-tight break-words">
                                        QUALITY MANAGEMENT SYSTEM
                                    </div>
                                    <div className="text-center text-[9px] font-bold leading-tight break-words">
                                        PERIODIC MAINTENANCE SYSTEM - FORM
                                    </div>
                                </div>
                                <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                                    <div className="text-[7px] leading-tight mb-0.5">
                                        Title:
                                    </div>
                                    <div className="text-center text-[9px] font-bold leading-tight break-words">
                                        EQUIPMENT MAINTENANCE RECORD
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 flex flex-col text-[8px]">
                                <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                    <span className="leading-tight">
                                        Document No.:
                                    </span>
                                    <span className="block text-center font-bold text-[9px] leading-tight break-words">
                                        BiPSU-QAA-PMS-005
                                    </span>
                                </div>
                                <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                                    <span>Page:</span>
                                    <span className="font-bold">
                                        {totalPdfPages > 1
                                            ? `1 of ${totalPdfPages} (view)`
                                            : `1 of ${totalPdfPages}`}
                                    </span>
                                </div>
                                <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                    <span className="leading-tight">
                                        Effective Date:
                                    </span>
                                    <span className="block text-center font-bold leading-tight">
                                        October 09, 2020
                                    </span>
                                </div>
                                <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                                    <span className="leading-tight">
                                        Issuance/Revision:
                                    </span>
                                    <span className="block text-center font-bold leading-tight">
                                        02/01
                                    </span>
                                </div>
                            </div>
                        </header>

                        <div className="mt-6 mb-3 flex items-center justify-center gap-1 shrink-0">
                            <Building2 className="w-3 h-3" />
                            <span className="text-[11px] font-bold">
                                SCHOOL/OFFICE OF
                            </span>
                            <span
                                className="border-b border-black text-center font-bold text-[11px] px-2 inline-block"
                                style={{
                                    width: `${Math.max(
                                        260,
                                        (officeName?.length || 0) * 7 + 20
                                    )}px`,
                                    paddingBottom: "4px",
                                    minHeight: "16px",
                                }}
                            >
                                {officeName || "\u00A0"}
                            </span>
                        </div>

                        <div className="pms-view-scroll flex-1 min-h-0 max-h-[650px]">
                            <table className="pms-view-table w-full table-fixed">
                                <thead>
                                    <tr className="text-[8px] font-bold text-center">
                                        <th className="border border-black px-0.5 py-1 w-[10%] sticky top-0 bg-white z-20">
                                            Code
                                            <br />
                                            No.
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[15%] sticky top-0 bg-white z-20">
                                            Name of
                                            <br />
                                            Equip/Tools
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[10%] sticky top-0 bg-white z-20">
                                            Period
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[16%] sticky top-0 bg-white z-20">
                                            Spare Parts /
                                            <br />
                                            Materials
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[10%] sticky top-0 bg-white z-20">
                                            Manhour
                                            <br />
                                            Used
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[16%] sticky top-0 bg-white z-20">
                                            Problem
                                            <br />
                                            Encountered
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[15%] sticky top-0 bg-white z-20">
                                            Tech / Lab
                                            <br />
                                            In-Charge
                                        </th>
                                        <th className="border border-black px-0.5 py-1 w-[8%] sticky top-0 bg-white z-20">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRows005.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="text-[8px] text-center h-[28px]"
                                        >
                                            <td className="border border-black px-0.5 py-0.5">
                                                {item.codeNo || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5">
                                                {item.name || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5">
                                                {item.period || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5 break-words">
                                                {item.Spare_Parts || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5">
                                                {item.Man_hour_used || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5 break-words">
                                                {item.Problem_Encounter || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5 break-words">
                                                {item.Tech_InCharge || ""}
                                            </td>
                                            <td className="border border-black px-0.5 py-0.5">
                                                {item.Date || ""}
                                            </td>
                                        </tr>
                                    ))}

                                    {Array.from({
                                        length: emptyRowsForFullForm,
                                    }).map((_, idx) => (
                                        <tr
                                            key={`empty-${idx}`}
                                            className="h-[28px]"
                                        >
                                            {Array.from({ length: 8 }).map(
                                                (_, i) => (
                                                    <td
                                                        key={i}
                                                        className="border border-black"
                                                    />
                                                )
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-8 text-[9px] shrink-0">
                            {["prepared", "attested", "approved"].map(
                                (field) => (
                                    <div key={field}>
                                        <div className="mb-8 font-medium capitalize">
                                            {field}:
                                        </div>
                                        <input
                                            type="text"
                                            value={signatures[field] || ""}
                                            onChange={(e) =>
                                                onSignatureChange &&
                                                onSignatureChange(
                                                    field,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border-b border-black text-center outline-none bg-transparent text-[9px] font-bold h-5"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}