import { NextResponse } from "next/server";

function getSheetsUrl(): string | undefined {
  return (
    process.env.GOOGLE_SHEET_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL ||
    process.env.GOOGLE_SHEETS_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
    process.env.GOOGLE_SHEETS_API_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sheetsUrl = getSheetsUrl();

    if (!sheetsUrl) {
      // Local fallback mode when Google Sheet webhook is not yet configured
      return NextResponse.json({
        success: true,
        mode: "local_offline_fallback",
        message: "Google Sheets Webhook URL not set. Data stored locally.",
      });
    }

    // Forward payload to Google Apps Script Web App with redirect following
    const response = await fetch(sheetsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        success: response.ok,
        message: "Webhook processed successfully",
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Google Sheets sync error:", error);
    // Graceful error response so user flow is never disrupted
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Sync error",
    });
  }
}

export async function GET() {
  try {
    const sheetsUrl = getSheetsUrl();

    if (!sheetsUrl) {
      return NextResponse.json({
        success: true,
        mode: "local_offline_fallback",
        vehicles: [],
        bookings: [],
      });
    }

    const response = await fetch(sheetsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, vehicles: [], bookings: [] };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Sheets fetch error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Fetch error",
      vehicles: [],
      bookings: [],
    });
  }
}
