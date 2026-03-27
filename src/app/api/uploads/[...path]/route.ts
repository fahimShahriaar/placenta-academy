import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/constants";
import { Readable } from "stream";

const MIME_TYPES: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;
    const filePath = segments.join("/");

    // Prevent path traversal
    if (filePath.includes("..") || filePath.includes("~")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fullPath = path.join(path.resolve(UPLOAD_DIR), filePath);
    const uploadsDir = path.resolve(UPLOAD_DIR);

    if (!fullPath.startsWith(uploadsDir)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let stat;
    try {
        stat = statSync(fullPath);
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const download = request.nextUrl.searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const fileName = path.basename(fullPath);

    const stream = createReadStream(fullPath);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
        headers: {
            "Content-Type": contentType,
            "Content-Length": stat.size.toString(),
            "Content-Disposition": `${disposition}; filename="${fileName}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
