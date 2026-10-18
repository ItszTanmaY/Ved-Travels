import { Booking, Vehicle } from "@/data/fleet";

/**
 * Client helper to sync bookings and vehicles to Google Sheets in the background.
 * Works seamlessly with zero blocking/lag on UI.
 */

export async function syncBookingToGoogleSheets(booking: Booking) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_booking",
        ...booking,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Background Google Sheets sync notice (saved locally):", err);
    return { success: false, offline: true };
  }
}

export async function syncVehicleToGoogleSheets(vehicle: Vehicle) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit_vehicle",
        ...vehicle,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Background Google Sheets sync notice (saved locally):", err);
    return { success: false, offline: true };
  }
}

export async function updateBookingStatusInGoogleSheets(
  bookingCode: string,
  status: string
) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_booking_status",
        bookingCode,
        status,
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets status update notice:", err);
    return { success: false };
  }
}

export async function approveVehicleInGoogleSheets(vehicleId: string) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve_vehicle",
        vehicleId,
        approvalStatus: "approved",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets vehicle approval notice:", err);
    return { success: false };
  }
}

export async function fetchGoogleSheetsData() {
  try {
    const res = await fetch("/api/sheets", { method: "GET" });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets fetch notice:", err);
    return { success: false, vehicles: [], bookings: [] };
  }
}
