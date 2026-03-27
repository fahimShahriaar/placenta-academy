export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Placenta Academy";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
export const MAX_PDF_SIZE = Number(process.env.MAX_PDF_SIZE) || 52428800; // 50MB
export const MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE) || 5242880; // 5MB
export const ITEMS_PER_PAGE = 12;
