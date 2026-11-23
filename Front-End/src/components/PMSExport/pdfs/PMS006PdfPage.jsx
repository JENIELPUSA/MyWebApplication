// src/components/PMSComponent/pdfs/PMS006PdfPage.jsx
import React from "react";
import { FileText, X, ChevronDown, Building2, AlertCircle } from "lucide-react";
import bispulogo from "../../../assets/bipsulogo.png";

// ============================================================
// PDF PAGE — PMS006 (LANDSCAPE, 10 columns)
// Columns: Code, Name, Analysis, Adjustment, Manhour, Counter, Improvement, Spare, Incharge, Date
// ============================================================
export function PMS006PdfPage({
    pageItems = [],
    pageNumber = 1,
    totalPages = 1,
    officeName = "",
    signatures = { prepared: "", attested: "", approved: "" },
    emptyRowCount,
    minRows = 12,
    widthPx = 1123,
    heightPx = 794,
}) {
    const computedEmptyRows =
        typeof emptyRowCount === "number"
            ? emptyRowCount
            : Math.max(0, minRows - pageItems.length);

    return (
        <div
            className="pdf-page pdf-page-pms006 bg-white"
            style={{
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                minWidth: `${widthPx}px`,
                maxWidth: `${widthPx}px`,
                minHeight: `${heightPx}px`,
                maxHeight: `${heightPx}px`,
                padding: "35px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
            }}
        >
            {/* HEADER */}
            <header className="border border-black grid grid-cols-12 min-h-[100px]">
                <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                    <img
                        src={bispulogo}
                        alt="BiPSU Logo"
                        crossOrigin="anonymous"
                        className="w-[80px] h-[80px] object-contain mb-1"
                    />
                </div>
                <div className="col-span-6 border-r border-black flex flex-col">
                    <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">
                            Type:
                        </div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">
                            QUALITY MANAGEMENT SYSTEM
                        </div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">
                            PERIODIC MAINTENANCE SYSTEM - FORM
                        </div>
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">
                            Title:
                        </div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">
                            MAINTENANCE PLAN/SCHEDULE (UNSCHEDULE REPAIR)
                        </div>
                    </div>
                </div>
                <div className="col-span-3 flex flex-col text-[9px]">
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Document No.:</span>
                        <span className="block text-center font-bold text-[10px] leading-tight break-words">
                            BiPSU-QAA-PMS-006
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
            <div className="mt-5 mb-3 flex items-center justify-center gap-1">
                <span className="text-[12px] font-bold">SCHOOL/OFFICE OF</span>
                <span
                    className="border-b border-black text-center font-bold text-[12px] px-2"
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

            {/* TABLE — 10 columns */}
            <table className="w-full border-collapse border border-black table-fixed">
                <thead>
                    <tr className="text-[9px] font-bold text-center">
                        <th className="border border-black px-1 py-1 w-[7%]">
                            Code
                            <br />
                            No.
                        </th>
                        <th className="border border-black px-1 py-1 w-[9%]">
                            Name of
                            <br />
                            Equipment / Tools
                        </th>
                        <th className="border border-black px-1 py-1 w-[11%]">
                            Analysis of
                            <br />
                            Trouble
                        </th>
                        <th className="border border-black px-1 py-1 w-[10%]">
                            Adjustment /
                            <br />
                            Setting
                        </th>
                        <th className="border border-black px-1 py-1 w-[7%]">
                            Manhour
                            <br />
                            Use
                        </th>
                        <th className="border border-black px-1 py-1 w-[11%]">
                            Counter
                            <br />
                            Measures
                        </th>
                        <th className="border border-black px-1 py-1 w-[12%]">
                            Improvement /
                            <br />
                            Repair Procedure
                        </th>
                        <th className="border border-black px-1 py-1 w-[12%]">
                            Spare Parts /
                            <br />
                            Materials Used
                        </th>
                        <th className="border border-black px-1 py-1 w-[10%]">
                            Incharge
                        </th>
                        <th className="border border-black px-1 py-1 w-[11%]">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* ✅ Data rows */}
                    {pageItems.map((item, idx) => (
                        <tr
                            key={item.id || `row-${idx}`}
                            className="text-[9px] text-center h-[32px]"
                        >
                            <td className="border border-black px-1 py-0.5">
                                {item.codeNo || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5">
                                {item.name || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5 break-words">
                                {item.analysisTrouble || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5 break-words">
                                {item.adjustmentSetting || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5">
                                {item.manHourUse || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5 break-words">
                                {item.counterMeasures || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5 break-words">
                                {item.improvementRepairProcedure || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5 break-words">
                                {item.sparePartsMaterialsUsed || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5 break-words">
                                {item.incharge || ""}
                            </td>
                            <td className="border border-black px-1 py-0.5">
                                {item.maintenanceDate || ""}
                            </td>
                        </tr>
                    ))}

                    {/* ✅ Default empty rows */}
                    {Array.from({ length: computedEmptyRows }).map(
                        (_, index) => (
                            <tr key={`empty-${index}`} className="h-[32px]">
                                {Array.from({ length: 10 }).map((_, i) => (
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
            <div className="mt-6 grid grid-cols-3 gap-8 text-[10px]">
                <div>
                    <div className="mb-6 font-medium">Prepared:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {signatures.prepared || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-6 font-medium">Attested:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {signatures.attested || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-6 font-medium">Approved:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {signatures.approved || "\u00A0"}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// VIEWER — PMS006 (mini card + full form)
// ✅ Laging visible kahit walang data
// ============================================================
export function PMS006Viewer({
    allRows006 = [],
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
    minRows = 12,
}) {
    const A4L_HEIGHT = 794;

    const performedByName = performedBy
        ? [performedBy.FirstName, performedBy.Middle, performedBy.LastName]
              .filter(Boolean)
              .join(" ") || performedBy.username || "N/A"
        : null;

    const emptyRowsForFullForm = Math.max(0, minRows - allRows006.length);

    return (
        <>
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-teal-600 text-white shadow-sm">
                        PMS006
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Maintenance Plan/Schedule (Unschedule Repair) —
                        Landscape
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
                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-500 mt-3">
                            Loading PMS006 records...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* MINI CARD — landscape mockup */}
                        <div
                            onClick={miniExpanded ? onCloseFull : onOpenFull}
                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.99] ${
                                miniExpanded
                                    ? "ring-2 ring-teal-500 rounded-md"
                                    : ""
                            }`}
                            title={
                                miniExpanded
                                    ? "Click to close full form"
                                    : "Click to open PMS006 full form"
                            }
                        >
                            <div
                                className="bg-white border border-slate-300 shadow-lg"
                                style={{
                                    width: "440px",
                                    height: "310px",
                                    padding: "12px",
                                    transform: miniExpanded
                                        ? "rotate(0deg)"
                                        : "rotate(-1deg)",
                                }}
                            >
                                <div className="border border-black grid grid-cols-12 h-[44px] mb-1">
                                    <div className="col-span-3 border-r border-black flex items-center justify-center">
                                        <img
                                            src={bispulogo}
                                            alt="logo"
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                    <div className="col-span-6 border-r border-black flex flex-col justify-center px-0.5">
                                        <div className="text-[3.5px] font-bold text-center leading-tight">
                                            QUALITY MANAGEMENT SYSTEM
                                        </div>
                                        <div className="text-[3.5px] font-bold text-center leading-tight">
                                            PERIODIC MAINTENANCE SYSTEM - FORM
                                        </div>
                                        <div className="text-[3.5px] font-bold text-center leading-tight mt-0.5">
                                            MAINTENANCE PLAN/SCHEDULE (UNSCHEDULE REPAIR)
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex flex-col text-[3px] px-0.5">
                                        <div className="border-b border-black flex-1 flex items-center justify-center font-bold">
                                            BiPSU-QAA-PMS-006
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

                                <div className="text-[4.5px] text-center font-bold mb-1 truncate">
                                    SCHOOL/OFFICE OF{" "}
                                    <span className="border-b border-black inline-block px-0.5">
                                        {officeName || "—"}
                                    </span>
                                </div>

                                <div className="border border-black">
                                    <div className="grid grid-cols-10 h-[10px] border-b border-black bg-slate-100">
                                        {[
                                            "Code",
                                            "Name",
                                            "Analysis",
                                            "Adj",
                                            "MH",
                                            "CM",
                                            "IRP",
                                            "Spare",
                                            "Inch",
                                            "Date",
                                        ].map((h, i) => (
                                            <div
                                                key={i}
                                                className="border-r border-black last:border-r-0 text-[2.5px] font-bold flex items-center justify-center text-center"
                                            >
                                                {h}
                                            </div>
                                        ))}
                                    </div>
                                    {Array.from({ length: 8 }).map(
                                        (_, rowIdx) => (
                                            <div
                                                key={rowIdx}
                                                className="grid grid-cols-10 h-[11px] border-b border-black last:border-b-0"
                                            >
                                                {Array.from({
                                                    length: 10,
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

                                <div className="grid grid-cols-3 gap-1 mt-1.5">
                                    {[
                                        "Prepared",
                                        "Attested",
                                        "Approved",
                                    ].map((label) => (
                                        <div
                                            key={label}
                                            className="text-center"
                                        >
                                            <div className="text-[3px] mb-1">
                                                {label}:
                                            </div>
                                            <div className="border-b border-black h-1" />
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
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            {miniExpanded ? (
                                <>
                                    <X className="w-3.5 h-3.5" />
                                    Close PMS006 form
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    Open PMS006 form
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
                    <div className="flex items-center gap-2 w-[1123px] max-w-full">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-teal-600 text-white shadow-sm">
                            PMS006
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Full Form — {officeName || "PMS"} (
                            {allRows006.length} rows, {totalPdfPages} page
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
                        className="bg-white w-[1123px] max-w-full p-[35px] border border-slate-400 shadow-xl text-black flex flex-col"
                        style={{ minHeight: `${A4L_HEIGHT}px` }}
                    >
                        <header className="border border-black grid grid-cols-12 min-h-[100px] shrink-0">
                            <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                                <img
                                    src={bispulogo}
                                    alt="BiPSU Logo"
                                    crossOrigin="anonymous"
                                    className="w-[80px] h-[80px] object-contain mb-1"
                                />
                            </div>
                            <div className="col-span-6 border-r border-black flex flex-col">
                                <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                                    <div className="text-[8px] leading-tight mb-0.5">
                                        Type:
                                    </div>
                                    <div className="text-center text-[11px] font-bold leading-tight break-words">
                                        QUALITY MANAGEMENT SYSTEM
                                    </div>
                                    <div className="text-center text-[11px] font-bold leading-tight break-words">
                                        PERIODIC MAINTENANCE SYSTEM - FORM
                                    </div>
                                </div>
                                <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                                    <div className="text-[8px] leading-tight mb-0.5">
                                        Title:
                                    </div>
                                    <div className="text-center text-[11px] font-bold leading-tight break-words">
                                        MAINTENANCE PLAN/SCHEDULE (UNSCHEDULE REPAIR)
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 flex flex-col text-[9px]">
                                <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                    <span className="leading-tight">
                                        Document No.:
                                    </span>
                                    <span className="block text-center font-bold text-[10px] leading-tight break-words">
                                        BiPSU-QAA-PMS-006
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

                        <div className="mt-5 mb-3 flex items-center justify-center gap-1 shrink-0">
                            <Building2 className="w-3 h-3" />
                            <span className="text-[12px] font-bold">
                                SCHOOL/OFFICE OF
                            </span>
                            <span
                                className="border-b border-black text-center font-bold text-[12px] px-2 inline-block"
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

                        <div className="pms-view-scroll flex-1 min-h-0 max-h-[420px] overflow-y-auto border border-black bg-white">
                            <table
                                className="w-full table-fixed"
                                style={{
                                    borderCollapse: "separate",
                                    borderSpacing: 0,
                                }}
                            >
                                <thead>
                                    <tr className="text-[9px] font-bold text-center h-[26px]">
                                        <th className="border-r border-b border-black px-1 py-1 w-[7%] sticky top-0 bg-white z-20">
                                            Code
                                            <br />
                                            No.
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[9%] sticky top-0 bg-white z-20">
                                            Name of
                                            <br />
                                            Equipment/Tools
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[11%] sticky top-0 bg-white z-20">
                                            Analysis of
                                            <br />
                                            Trouble
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[10%] sticky top-0 bg-white z-20">
                                            Adjustment /
                                            <br />
                                            Setting
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[7%] sticky top-0 bg-white z-20">
                                            Manhour
                                            <br />
                                            Use
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[11%] sticky top-0 bg-white z-20">
                                            Counter
                                            <br />
                                            Measures
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[12%] sticky top-0 bg-white z-20">
                                            Improvement /
                                            <br />
                                            Repair Procedure
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[12%] sticky top-0 bg-white z-20">
                                            Spare Parts /
                                            <br />
                                            Materials Used
                                        </th>
                                        <th className="border-r border-b border-black px-1 py-1 w-[10%] sticky top-0 bg-white z-20">
                                            Incharge
                                        </th>
                                        <th className="border-b border-black px-1 py-1 w-[11%] sticky top-0 bg-white z-20">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRows006.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="text-[9px] text-center h-[32px]"
                                        >
                                            <td className="border-r border-b border-black px-1 py-0.5">
                                                {item.codeNo || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5">
                                                {item.name || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5 break-words">
                                                {item.analysisTrouble || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5 break-words">
                                                {item.adjustmentSetting || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5">
                                                {item.manHourUse || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5 break-words">
                                                {item.counterMeasures || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5 break-words">
                                                {item.improvementRepairProcedure || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5 break-words">
                                                {item.sparePartsMaterialsUsed || ""}
                                            </td>
                                            <td className="border-r border-b border-black px-1 py-0.5 break-words">
                                                {item.incharge || ""}
                                            </td>
                                            <td className="border-b border-black px-1 py-0.5">
                                                {item.maintenanceDate || ""}
                                            </td>
                                        </tr>
                                    ))}

                                    {Array.from({
                                        length: emptyRowsForFullForm,
                                    }).map((_, idx) => (
                                        <tr
                                            key={`empty-${idx}`}
                                            className="h-[32px]"
                                        >
                                            {Array.from({ length: 10 }).map(
                                                (_, i) => (
                                                    <td
                                                        key={i}
                                                        className="border-r border-b border-black last:border-r-0"
                                                    />
                                                )
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-8 text-[10px] shrink-0">
                            {["prepared", "attested", "approved"].map(
                                (field) => (
                                    <div key={field}>
                                        <div className="mb-6 font-medium capitalize">
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
                                            className="w-full border-b border-black text-center outline-none bg-transparent text-[10px] font-bold h-5"
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