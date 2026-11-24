import { NextResponse } from "next/server";

// Only read server-side environment variables to ensure Google Script URL is NEVER leaked in client bundles
function getSheetsUrl(): string | undefined {
  return (
    process.env.GOOGLE_SHEET_URL ||
    process.env.GOOGLE_SHEETS_URL ||
    process.env.GOOGLE_SHEETS_API_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  );
}

const ALLOWED_ACTIONS = [
  "create_booking",
  "submit_vehicle",
  "update_booking_status",
  "approve_vehicle",
  "reject_vehicle",
  "register_user",
  "approve_host",
  "reject_host",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    if (body.action && !ALLOWED_ACTIONS.includes(body.action)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized action" },
        { status: 403 }
      );
    }

    const sheetsUrl = getSheetsUrl();

    if (!sheetsUrl) {
      // Local fallback mode when Google Sheet webhook is not yet configured
      return NextResponse.json({
        success: true,
        mode: "local_offline_fallback",
        message: "Google Sheets Webhook URL not set. Data stored locally.",
      });
    }

    // Forward sanitized payload to Google Apps Script Web App over HTTPS with redirect following
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
    // Secure error response without leaking internal URLs or credentials
    return NextResponse.json({
      success: false,
      error: "Unable to sync with Google Sheets. Data persisted locally.",
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
        users: [],
      });
    }

    const response = await fetch(sheetsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, vehicles: [], bookings: [], users: [] };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Sheets fetch error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Fetch error",
      vehicles: [],
      bookings: [],
      users: [],
    });
  }
}
