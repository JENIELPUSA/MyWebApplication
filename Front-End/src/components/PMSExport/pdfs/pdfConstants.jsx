// src/components/PMSExport/pdfs/pdfConstants.js

export const A4P_WIDTH_PX = 794;
export const A4P_HEIGHT_PX = 1123;
export const A4P_WIDTH_MM = 210;
export const A4P_HEIGHT_MM = 297;

export const A4L_WIDTH_PX = 1123;
export const A4L_HEIGHT_PX = 794;
export const A4L_WIDTH_MM = 297;
export const A4L_HEIGHT_MM = 210;

export const ROW_HEIGHT_PX = 32;
export const A4L_CONTENT_HEIGHT = A4L_HEIGHT_PX - 80;
export const DEFAULT_ROWS_PER_PAGE = 10;

export const CHECKBOX_FIELDS = [
    "routineInspection",
    "lubrication",
    "overhauling",
    "minorAdjustment",
    "replaceWornOutParts",
    "repair",
    "generalRecondition",
    "repairPart",
];

export const CHECKBOX_FIELDS_004 = [
    "routineInspection",
    "lubrication",
    "minorAdjustment",
    "repair",
];