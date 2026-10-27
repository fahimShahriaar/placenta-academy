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
                    backgroundColor: "#132a35",
                    backgroundImage:
                        "radial-gradient(circle at 85% 15%, #087f73 0%, transparent 45%), radial-gradient(circle at 10% 95%, rgba(239,129,111,0.35) 0%, transparent 35%)",
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
                            color: "#a9bcbd",
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
                            color: "#f7f8f4",
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
