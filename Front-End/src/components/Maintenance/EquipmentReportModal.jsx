// src/components/Reports/EquipmentReportModal.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import bispulogo from "../../assets/bipsulogo.png";

import {
    FileText,
    X,
    Download,
    Loader2,
    Printer,
    ArrowLeft,
    Eye,
} from "lucide-react";

// ============================================================
// ✅ CONSTANTS — PORTRAIT & LANDSCAPE
// ============================================================
const PORTRAIT_WIDTH_PX = 794;
const PORTRAIT_HEIGHT_PX = 1123;
const PORTRAIT_WIDTH_MM = 210;
const PORTRAIT_HEIGHT_MM = 297;

const LANDSCAPE_WIDTH_PX = 1123;
const LANDSCAPE_HEIGHT_PX = 794;
const LANDSCAPE_WIDTH_MM = 297;
const LANDSCAPE_HEIGHT_MM = 210;

const ROWS_PER_PAGE_PORTRAIT = 20;
const ROWS_PER_PAGE_LANDSCAPE = 15;

// ✅ Threshold — 6 columns max para sa portrait
const PORTRAIT_MAX_COLUMNS = 6;

// ============================================================
// HELPER — Chunk items into pages
// ============================================================
const chunkItemsIntoPages = (items, rowsPerPage) => {
    if (!Array.isArray(items) || items.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < items.length; i += rowsPerPage) {
        pages.push(items.slice(i, i + rowsPerPage));
    }
    return pages;
};

// ============================================================
// ✅ DYNAMIC COLUMNS BUILDER (WALANG PMS)
// ============================================================
const buildColumns = (formData, rowsPerPage = ROWS_PER_PAGE_PORTRAIT) => {
    const cols = [
        {
            key: "index",
            label: "#",
            width: 4,
            align: "center",
            render: (_e, idx, pageNumber) =>
                (pageNumber - 1) * rowsPerPage + idx + 1,
        },
        {
            key: "code",
            label: "Code",
            width: 12,
            align: "center",
            render: (e) => e.code || e.codeNo || "N/A",
        },
    ];

    if (formData.includeSerialNumber) {
        cols.push({
            key: "SerialNumber",
            label: "Serial #",
            width: 13,
            align: "center",
            render: (e) => e.SerialNumber || "N/A",
        });
    }
    if (formData.includeBrand) {
        cols.push({
            key: "Brand",
            label: "Brand",
            width: 11,
            align: "center",
            render: (e) => e.Brand || e.name || "N/A",
        });
    }
    if (formData.includeCategory) {
        cols.push({
            key: "categoryName",
            label: "Category",
            width: 11,
            align: "center",
            render: (e) => e.categoryName || "N/A",
        });
    }
    if (formData.includeLaboratory) {
        cols.push({
            key: "laboratoryName",
            label: "Laboratory",
            width: 13,
            align: "center",
            render: (e, _idx, _pn, labName) =>
                e.laboratoryName || labName || "N/A",
        });
    }

    // Status — always included
    cols.push({
        key: "status",
        label: "Status",
        width: 8,
        align: "center",
        render: (e) => e.status || "N/A",
    });

    if (formData.includeDates) {
        cols.push({
            key: "lastMaintenanceDate",
            label: "Last Maint.",
            width: 10,
            align: "center",
            render: (e) => {
                if (!e.lastMaintenanceDate) return "N/A";
                return new Date(e.lastMaintenanceDate).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "short", day: "numeric" }
                );
            },
        });
        cols.push({
            key: "nextMaintenanceDate",
            label: "Next Maint.",
            width: 10,
            align: "center",
            render: (e) => {
                if (!e.nextMaintenanceDate) return "N/A";
                return new Date(e.nextMaintenanceDate).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "short", day: "numeric" }
                );
            },
        });
    }

    const totalWidth = cols.reduce((sum, c) => sum + c.width, 0);
    return cols.map((c) => ({
        ...c,
        widthPct: ((c.width / totalWidth) * 100).toFixed(2),
    }));
};

// ============================================================
// ✅ STATIC PDF PAGE — DYNAMIC ORIENTATION
// ============================================================
function EquipmentReportPdfPage({
    pageItems,
    pageNumber,
    totalPages,
    formData,
    labName,
    emptyRowCount = 0,
    orientation = "portrait", // ✅ "portrait" | "landscape"
}) {
    const isLandscape = orientation === "landscape";

    const WIDTH_PX = isLandscape ? LANDSCAPE_WIDTH_PX : PORTRAIT_WIDTH_PX;
    const HEIGHT_PX = isLandscape ? LANDSCAPE_HEIGHT_PX : PORTRAIT_HEIGHT_PX;
    const ROWS_PER_PAGE = isLandscape
        ? ROWS_PER_PAGE_LANDSCAPE
        : ROWS_PER_PAGE_PORTRAIT;

    const columns = buildColumns(formData, ROWS_PER_PAGE);

    return (
        <div
            className="pdf-page bg-white"
            style={{
                width: `${WIDTH_PX}px`,
                height: `${HEIGHT_PX}px`,
                minWidth: `${WIDTH_PX}px`,
                maxWidth: `${WIDTH_PX}px`,
                minHeight: `${HEIGHT_PX}px`,
                maxHeight: `${HEIGHT_PX}px`,
                padding: "35px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* HEADER — REPUBLIC OF THE PHILIPPINES */}
            <header className="border border-black shrink-0">
                <div
                    className={`grid grid-cols-12 ${
                        isLandscape ? "min-h-[90px]" : "min-h-[110px]"
                    }`}
                >
                    {/* LEFT: LOGO */}
                    <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                        <img
                            src={bispulogo}
                            alt="BiPSU Logo"
                            crossOrigin="anonymous"
                            className={`${
                                isLandscape
                                    ? "w-[70px] h-[70px]"
                                    : "w-[85px] h-[85px]"
                            } object-contain mb-1`}
                        />
                    </div>

                    {/* CENTER: REPUBLIC INFO */}
                    <div className="col-span-6 border-r border-black flex flex-col">
                        <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                            <div className="text-center text-[11px] font-bold leading-tight">
                                Republic of the Philippines
                            </div>
                        </div>

                        <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                            <div className="text-center text-[10px] font-bold leading-tight">
                                Biliran Province
                            </div>
                        </div>

                        <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                            <div className="text-center text-[10px] font-bold leading-tight">
                                Naval, Biliran
                            </div>
                        </div>

                        <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                            <div className="text-center text-[11px] font-bold leading-tight break-words uppercase">
                                {formData.title || "EQUIPMENT INVENTORY REPORT"}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: META */}
                    <div className="col-span-3 flex flex-col text-[9px]">
                        <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                            <span className="leading-tight">
                                Report Type:
                            </span>
                            <span className="block text-center font-bold text-[10px] leading-tight break-words uppercase">
                                {formData.reportType}
                            </span>
                        </div>
                        <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                            <span>Page:</span>
                            <span className="font-bold">
                                {pageNumber} of {totalPages}
                            </span>
                        </div>
                        <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                            <span className="leading-tight">Generated:</span>
                            <span className="block text-center font-bold leading-tight">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                            <span className="leading-tight">Format:</span>
                            <span className="block text-center font-bold leading-tight uppercase">
                                {isLandscape ? "LANDSCAPE" : "PORTRAIT"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SUB-HEADER — Laboratory */}
                <div className="border-t border-black px-2 py-2 flex items-center justify-center gap-2 bg-slate-50">
                    <span className="text-[11px] font-bold">
                        SCHOOL/OFFICE OF
                    </span>
                    <span
                        className="border-b border-black text-center font-bold text-[11px] px-2"
                        style={{
                            minWidth: "260px",
                            display: "inline-block",
                            paddingBottom: "2px",
                        }}
                    >
                        {labName || "\u00A0"}
                    </span>
                </div>
            </header>

            {/* META INFO */}
            <div className="mt-3 mb-2 grid grid-cols-3 gap-2 text-[9px] bg-slate-100 p-2 rounded shrink-0">
                <div>
                    <strong>Status:</strong> {formData.status || "All"}
                </div>
                <div>
                    <strong>Total:</strong> {formData.totalRecords}
                </div>
                <div>
                    <strong>Prepared By:</strong> {formData.preparedBy || "—"}
                </div>
                <div>
                    <strong>Date From:</strong> {formData.dateFrom || "—"}
                </div>
                <div>
                    <strong>Date To:</strong> {formData.dateTo || "—"}
                </div>
                <div>
                    <strong>Report Type:</strong>{" "}
                    <span className="uppercase">{formData.reportType}</span>
                </div>
            </div>

            {/* MAIN TABLE */}
            <table
                className="w-full border-collapse border border-black table-fixed"
                style={{ tableLayout: "fixed", width: "100%" }}
            >
                <colgroup>
                    {columns.map((col) => (
                        <col
                            key={col.key}
                            style={{ width: `${col.widthPct}%` }}
                        />
                    ))}
                </colgroup>

                <thead>
                    <tr className="text-[8px] font-bold text-center bg-slate-100">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="border border-black px-0.5 py-1 break-words"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {pageItems.map((e, idx) => (
                        <tr
                            key={e._id || e.id || idx}
                            className="text-[8px] text-center h-[28px]"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`border border-black px-0.5 py-0.5 break-words ${
                                        col.key === "code" ||
                                        col.key === "SerialNumber"
                                            ? "font-mono"
                                            : ""
                                    }`}
                                >
                                    {col.render(e, idx, pageNumber, labName)}
                                </td>
                            ))}
                        </tr>
                    ))}

                    {Array.from({ length: emptyRowCount }).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-[28px]">
                            {columns.map((col) => (
                                <td
                                    key={`empty-${i}-${col.key}`}
                                    className="border border-black"
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {formData.remarks && (
                <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-500 text-[9px] shrink-0">
                    <strong className="uppercase">Remarks:</strong>{" "}
                    {formData.remarks}
                </div>
            )}

            {/* SIGNATURES */}
            <div className="mt-auto pt-4 grid grid-cols-2 gap-12 text-[10px] shrink-0">
                <div>
                    <div className="mb-6 font-medium">Prepared By:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {formData.preparedBy || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-6 font-medium">Approved By:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        &nbsp;
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 text-center text-[8px] text-slate-400 shrink-0">
                Auto-generated by Equipment Maintenance Management System
            </div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function EquipmentReportModal({
    isOpen,
    onClose,
    equipmentData = [],
    laboratories = [],
    defaultPreparedBy = "",
}) {
    // ==========================================
    // STATE
    // ==========================================
    const [reportForm, setReportForm] = useState({
        title: "Equipment Inventory Report",
        reportType: "inventory",
        laboratory: "",
        status: "",
        brand: "",
        dateFrom: "",
        dateTo: "",
        includeSerialNumber: true,
        includeBrand: true,
        includeCategory: true,
        includeLaboratory: true,
        includeDates: true,
        preparedBy: defaultPreparedBy,
        remarks: "",
    });

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [pdfPreviewData, setPdfPreviewData] = useState([]);
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const pdfContainerRef = useRef(null);

    useEffect(() => {
        if (defaultPreparedBy) {
            setReportForm((prev) => ({
                ...prev,
                preparedBy: prev.preparedBy || defaultPreparedBy,
            }));
        }
    }, [defaultPreparedBy]);

    useEffect(() => {
        return () => {
            if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        };
    }, [previewBlobUrl]);

    useEffect(() => {
        if (isOpen) {
            setShowPDFPreview(false);
            setPdfPreviewData([]);
            if (previewBlobUrl) {
                URL.revokeObjectURL(previewBlobUrl);
                setPreviewBlobUrl(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // ==========================================
    // HELPERS
    // ==========================================
    const handleReportChange = (field, value) => {
        setReportForm((prev) => ({ ...prev, [field]: value }));
    };

    const getFilteredData = useCallback(() => {
        let filtered = [...equipmentData];

        if (reportForm.laboratory) {
            filtered = filtered.filter(
                (e) => e.laboratoryId === reportForm.laboratory
            );
        }
        if (reportForm.status) {
            filtered = filtered.filter((e) => e.status === reportForm.status);
        }
        if (reportForm.brand) {
            filtered = filtered.filter(
                (e) =>
                    (e.Brand || e.name || "").toLowerCase() ===
                    reportForm.brand.toLowerCase()
            );
        }
        if (reportForm.dateFrom) {
            const from = new Date(reportForm.dateFrom);
            filtered = filtered.filter((e) => {
                const d = e.lastMaintenanceDate
                    ? new Date(e.lastMaintenanceDate)
                    : null;
                return d && d >= from;
            });
        }
        if (reportForm.dateTo) {
            const to = new Date(reportForm.dateTo);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter((e) => {
                const d = e.lastMaintenanceDate
                    ? new Date(e.lastMaintenanceDate)
                    : null;
                return d && d <= to;
            });
        }

        if (reportForm.reportType === "defective") {
            filtered = filtered.filter((e) =>
                ["Defective", "Missing", "Not Available"].includes(e.status)
            );
        }

        return filtered;
    }, [equipmentData, reportForm]);

    // ==========================================
    // ✅ COMPUTED — Orientation base sa columns
    // ==========================================
    const previewColumns = buildColumns(reportForm);
    const columnCount = previewColumns.length;

    // ✅ Dynamic orientation
    const isLandscape = columnCount > PORTRAIT_MAX_COLUMNS;
    const orientation = isLandscape ? "landscape" : "portrait";

    const currentWidthPx = isLandscape
        ? LANDSCAPE_WIDTH_PX
        : PORTRAIT_WIDTH_PX;
    const currentHeightPx = isLandscape
        ? LANDSCAPE_HEIGHT_PX
        : PORTRAIT_HEIGHT_PX;
    const currentWidthMm = isLandscape
        ? LANDSCAPE_WIDTH_MM
        : PORTRAIT_WIDTH_MM;
    const currentHeightMm = isLandscape
        ? LANDSCAPE_HEIGHT_MM
        : PORTRAIT_HEIGHT_MM;
    const rowsPerPage = isLandscape
        ? ROWS_PER_PAGE_LANDSCAPE
        : ROWS_PER_PAGE_PORTRAIT;

    // ==========================================
    // ✅ PREVIEW PDF
    // ==========================================
    const handlePreviewPDF = useCallback(async () => {
        const filtered = getFilteredData();

        if (filtered.length === 0) {
            alert("⚠️ No data included in the report. Adjust the filters.");
            return;
        }

        setPdfPreviewData(filtered);
        setIsGeneratingPDF(true);

        await new Promise((r) => setTimeout(r, 1200));

        try {
            const container = pdfContainerRef.current;
            if (!container) throw new Error("PDF container not found");

            const pageNodes = Array.from(
                container.querySelectorAll(".pdf-page")
            );
            if (pageNodes.length === 0) throw new Error("No pages to export");

            if (document.fonts?.ready) await document.fonts.ready;

            const pdf = new jsPDF({
                orientation,
                unit: "mm",
                format: "a4",
                compress: true,
            });

            for (let i = 0; i < pageNodes.length; i++) {
                const canvas = await html2canvas(pageNodes[i], {
                    scale: 2,
                    width: currentWidthPx,
                    height: currentHeightPx,
                    windowWidth: currentWidthPx,
                    windowHeight: currentHeightPx,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                });

                const image = canvas.toDataURL("image/png", 1.0);
                if (i > 0) pdf.addPage();
                pdf.addImage(
                    image,
                    "PNG",
                    0,
                    0,
                    currentWidthMm,
                    currentHeightMm,
                    undefined,
                    "FAST"
                );
            }

            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);

            if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);

            setPreviewBlobUrl(url);
            setShowPDFPreview(true);
        } catch (err) {
            console.error("PDF preview error:", err);
            alert("❌ Failed to generate PDF: " + err.message);
        } finally {
            setIsGeneratingPDF(false);
        }
    }, [
        getFilteredData,
        previewBlobUrl,
        orientation,
        currentWidthPx,
        currentHeightPx,
        currentWidthMm,
        currentHeightMm,
    ]);

    // ==========================================
    // ✅ DOWNLOAD
    // ==========================================
    const handleDownloadPDF = useCallback(() => {
        if (!previewBlobUrl) return;
        const link = document.createElement("a");
        link.href = previewBlobUrl;
        const safeTitle = (reportForm.title || "Report")
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, "_");
        link.download = `${safeTitle}_${orientation}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [previewBlobUrl, reportForm.title, orientation]);

    // ==========================================
    // ✅ PRINT
    // ==========================================
    const handlePrintPDF = useCallback(() => {
        if (!previewBlobUrl) return;
        const printWindow = window.open(previewBlobUrl, "_blank");
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
        }
    }, [previewBlobUrl]);

    const handleBackToForm = () => {
        setShowPDFPreview(false);
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl(null);
        }
        setPdfPreviewData([]);
    };

    const handleClose = () => {
        setShowPDFPreview(false);
        setPdfPreviewData([]);
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl(null);
        }
        if (onClose) onClose();
    };

    // ==========================================
    // COMPUTED
    // ==========================================
    const pdfPages = chunkItemsIntoPages(pdfPreviewData, rowsPerPage);
    const totalPdfPages = pdfPages.length;

    const labNameForReport = reportForm.laboratory
        ? laboratories?.find((l) => l._id === reportForm.laboratory)
              ?.LaboratoryName || "N/A"
        : "All Laboratories";

    if (!isOpen) return null;

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <>
            {/* HIDDEN PDF RENDER CONTAINER */}
            <div
                ref={pdfContainerRef}
                style={{
                    position: "fixed",
                    left: "-10000px",
                    top: 0,
                    pointerEvents: "none",
                    zIndex: -1,
                }}
            >
                {pdfPreviewData.length > 0 &&
                    pdfPages.map((pageItems, idx) => {
                        const emptyRowCount = Math.max(
                            0,
                            rowsPerPage - pageItems.length
                        );
                        return (
                            <EquipmentReportPdfPage
                                key={`pdf-page-${idx}`}
                                pageItems={pageItems}
                                pageNumber={idx + 1}
                                totalPages={totalPdfPages}
                                formData={{
                                    ...reportForm,
                                    totalRecords: pdfPreviewData.length,
                                }}
                                labName={labNameForReport}
                                emptyRowCount={emptyRowCount}
                                orientation={orientation}
                            />
                        );
                    })}
            </div>

            {/* MODAL — ✅ z-[999] */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                <div
                    className={`bg-white rounded-2xl shadow-2xl w-full ${
                        showPDFPreview ? "max-w-6xl" : "max-w-2xl"
                    } max-h-[95vh] overflow-hidden flex flex-col`}
                >
                    {/* ============================================
                        ✅ HEADER — BLUE (English Subtitle)
                        ============================================ */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6" />
                            <div>
                                <h3 className="text-lg font-bold">
                                    {showPDFPreview
                                        ? "PDF Preview"
                                        : "Generate Report"}
                                </h3>
                                <p className="text-xs text-blue-100">
                                    {showPDFPreview
                                        ? `${pdfPreviewData.length} records • ${totalPdfPages} page${totalPdfPages > 1 ? "s" : ""} • ${orientation.toUpperCase()}`
                                        : "Select details for your PDF report"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ===== FORM VIEW ===== */}
                    {!showPDFPreview && (
                        <>
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                {/* ✅ Orientation Info Banner */}
                                <div
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                                        isLandscape
                                            ? "bg-amber-50 border-amber-200"
                                            : "bg-blue-50 border-blue-200"
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            isLandscape
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div
                                            className={`text-sm font-bold ${
                                                isLandscape
                                                    ? "text-amber-900"
                                                    : "text-blue-900"
                                            }`}
                                        >
                                            {isLandscape
                                                ? "Landscape Orientation"
                                                : "Portrait Orientation"}
                                        </div>
                                        <div
                                            className={`text-xs ${
                                                isLandscape
                                                    ? "text-amber-700"
                                                    : "text-blue-700"
                                            }`}
                                        >
                                            {columnCount} column
                                            {columnCount !== 1 ? "s" : ""}{" "}
                                            selected
                                            {isLandscape
                                                ? " (7+ columns → Landscape)"
                                                : " (≤6 columns → Portrait)"}
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                            isLandscape
                                                ? "bg-amber-200 text-amber-900"
                                                : "bg-blue-200 text-blue-900"
                                        }`}
                                    >
                                        {isLandscape ? "LANDSCAPE" : "PORTRAIT"}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Report Title
                                    </label>
                                    <input
                                        type="text"
                                        value={reportForm.title}
                                        onChange={(e) =>
                                            handleReportChange(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                            focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Equipment Inventory Report"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Report Type
                                    </label>
                                    <select
                                        value={reportForm.reportType}
                                        onChange={(e) =>
                                            handleReportChange(
                                                "reportType",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                            focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="inventory">
                                            Equipment Inventory
                                        </option>
                                        <option value="defective">
                                            Defective Equipment
                                        </option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Laboratory
                                        </label>
                                        <select
                                            value={reportForm.laboratory}
                                            onChange={(e) =>
                                                handleReportChange(
                                                    "laboratory",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                                focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="">
                                                All Laboratories
                                            </option>
                                            {laboratories?.map((lab) => (
                                                <option
                                                    key={lab._id}
                                                    value={lab._id}
                                                >
                                                    {lab.LaboratoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Status
                                        </label>
                                        <select
                                            value={reportForm.status}
                                            onChange={(e) =>
                                                handleReportChange(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                                focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="">All Status</option>
                                            <option value="Available">
                                                Available
                                            </option>
                                            <option value="Not Available">
                                                Not Available
                                            </option>
                                            <option value="Defective">
                                                Defective
                                            </option>
                                            <option value="Missing">
                                                Missing
                                            </option>
                                            <option value="Fixed">Fixed</option>
                                            <option value="Found">Found</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Date From
                                        </label>
                                        <input
                                            type="date"
                                            value={reportForm.dateFrom}
                                            onChange={(e) =>
                                                handleReportChange(
                                                    "dateFrom",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                                focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Date To
                                        </label>
                                        <input
                                            type="date"
                                            value={reportForm.dateTo}
                                            onChange={(e) =>
                                                handleReportChange(
                                                    "dateTo",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                                focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Columns to Include
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {[
                                            {
                                                key: "includeSerialNumber",
                                                label: "Serial Number",
                                            },
                                            {
                                                key: "includeBrand",
                                                label: "Brand",
                                            },
                                            {
                                                key: "includeCategory",
                                                label: "Category",
                                            },
                                            {
                                                key: "includeLaboratory",
                                                label: "Laboratory",
                                            },
                                            {
                                                key: "includeDates",
                                                label: "Maintenance Dates",
                                            },
                                        ].map((col) => (
                                            <label
                                                key={col.key}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200
                                                    hover:bg-blue-50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        reportForm[col.key]
                                                    }
                                                    onChange={(e) =>
                                                        handleReportChange(
                                                            col.key,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-xs font-medium text-gray-700">
                                                    {col.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="text-[11px] font-semibold text-blue-700 mb-1.5">
                                            Column Preview ({columnCount}{" "}
                                            column{columnCount !== 1 ? "s" : ""}):
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {previewColumns.map((col) => (
                                                <span
                                                    key={col.key}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px]
                                                        bg-white text-blue-700 rounded-md border border-blue-200 font-medium"
                                                >
                                                    {col.label}
                                                    <span className="text-blue-400">
                                                        ({col.widthPct}%)
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Prepared By
                                    </label>
                                    <input
                                        type="text"
                                        value={reportForm.preparedBy}
                                        onChange={(e) =>
                                            handleReportChange(
                                                "preparedBy",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                            focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Prepared by name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Remarks (Optional)
                                    </label>
                                    <textarea
                                        value={reportForm.remarks}
                                        onChange={(e) =>
                                            handleReportChange(
                                                "remarks",
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                            focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700
                                        bg-white border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePreviewPDF}
                                    disabled={isGeneratingPDF}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                                        bg-blue-600 hover:bg-blue-700 flex items-center gap-2
                                        shadow-md disabled:opacity-50"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Preview PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ===== PDF PREVIEW VIEW ===== */}
                    {showPDFPreview && (
                        <>
                            <div className="flex-1 overflow-hidden bg-gray-100 relative">
                                {previewBlobUrl ? (
                                    <iframe
                                        src={previewBlobUrl}
                                        title="PDF Preview"
                                        className="w-full h-full border-0"
                                        style={{ minHeight: "600px" }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between gap-3 border-t flex-shrink-0">
                                <button
                                    onClick={handleBackToForm}
                                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700
                                        bg-white border border-gray-300 hover:bg-gray-100
                                        flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Form
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrintPDF}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700
                                            bg-white border border-gray-300 hover:bg-gray-100
                                            flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                                            bg-emerald-600 hover:bg-emerald-700
                                            flex items-center gap-2 shadow-md"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}