import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { SITE_NAME } from "@/lib/constants";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const title = searchParams.get("title") || SITE_NAME;

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0f172a",
                    backgroundImage:
                        "radial-gradient(circle at 25% 25%, #1e3a5f 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0d9488 0%, transparent 50%)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "60px",
                        maxWidth: "900px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "28px",
                            color: "#94a3b8",
                            marginBottom: "16px",
                            fontWeight: 600,
                        }}
                    >
                        {SITE_NAME}
                    </div>
                    <div
                        style={{
                            fontSize: "56px",
                            fontWeight: 700,
                            color: "#f8fafc",
                            textAlign: "center",
                            lineHeight: 1.2,
                        }}
                    >
                        {title}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
