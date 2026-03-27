import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { UPLOAD_DIR, MAX_PDF_SIZE, MAX_IMAGE_SIZE } from "./constants";

// PDF magic bytes: %PDF
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]);

// Image magic bytes
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const WEBP_MAGIC_RIFF = Buffer.from([0x52, 0x49, 0x46, 0x46]);

function sanitizeFilename(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .substring(0, 100);
}

async function ensureDir(dir: string) {
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
}

export async function savePdf(file: File): Promise<{
    fileName: string;
    filePath: string;
    fileSize: number;
}> {
    if (file.size > MAX_PDF_SIZE) {
        throw new Error("PDF file exceeds the 50MB size limit.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate magic bytes
    if (!buffer.subarray(0, 4).equals(PDF_MAGIC)) {
        throw new Error("File is not a valid PDF.");
    }

    const uuid = randomUUID();
    const sanitized = sanitizeFilename(file.name);
    const storedName = `${uuid}-${sanitized}`;
    const dir = path.join(UPLOAD_DIR, "pdfs");
    await ensureDir(dir);

    const fullPath = path.join(dir, storedName);
    await writeFile(fullPath, buffer);

    return {
        fileName: file.name,
        filePath: `pdfs/${storedName}`,
        fileSize: file.size,
    };
}

export async function saveImage(file: File): Promise<string> {
    if (file.size > MAX_IMAGE_SIZE) {
        throw new Error("Image file exceeds the 5MB size limit.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate magic bytes
    const isJpeg = buffer.subarray(0, 3).equals(JPEG_MAGIC);
    const isPng = buffer.subarray(0, 4).equals(PNG_MAGIC);
    const isWebp =
        buffer.subarray(0, 4).equals(WEBP_MAGIC_RIFF) &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
        throw new Error("File must be a JPEG, PNG, or WebP image.");
    }

    const ext = isJpeg ? ".jpg" : isPng ? ".png" : ".webp";
    const uuid = randomUUID();
    const storedName = `${uuid}${ext}`;
    const dir = path.join(UPLOAD_DIR, "images");
    await ensureDir(dir);

    const fullPath = path.join(dir, storedName);
    await writeFile(fullPath, buffer);

    return `images/${storedName}`;
}

export async function deleteUploadedFile(filePath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    // Prevent path traversal
    const resolved = path.resolve(fullPath);
    const uploadsResolved = path.resolve(UPLOAD_DIR);
    if (!resolved.startsWith(uploadsResolved)) {
        throw new Error("Invalid file path.");
    }
    try {
        await unlink(resolved);
    } catch {
        // File may not exist, ignore
    }
}
