import { Booking, Vehicle, User } from "@/data/fleet";

/**
 * Client helper to sync bookings, vehicles, and registered users to Google Sheets in the background.
 * Works seamlessly with zero blocking/lag on UI.
 */

export async function syncBookingToGoogleSheets(booking: Booking) {
  try {
    const isHost = Boolean(booking.hostId || (booking.hostName && !booking.hostName.includes("Fleet")));
    const hostShare70 = booking.hostEarnings ?? (isHost ? Math.round(booking.baseRent * 0.70) : 0);
    const platformCommission30 = booking.platformFee ?? (isHost ? (booking.baseRent - hostShare70) : booking.totalAmount);
    const payoutStatus = booking.hostPayoutStatus === "paid" ? "Paid" : (isHost ? "Pending Settlement" : "N/A (Fleet)");

    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_booking",
        ...booking,
        hostShare70,
        platformCommission30,
        payoutStatus,
        pickupLocation: booking.pickupLocation || booking.hubName,
        pickupHub: booking.pickupLocation || booking.hubName,
        dlUploaded: booking.dlPhotoUrl ? "Yes (Photo Attached)" : "Pending at Hub",
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

export async function syncUserToGoogleSheets(user: User) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register_user",
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        hostStatus: user.hostStatus || (user.role === "host" ? "pending_approval" : "approved"),
        kycStatus: user.kycStatus,
        dlNumber: user.dlNumber || "",
        aadhaarNumber: user.aadhaarNumber || "",
        createdAt: user.createdAt || new Date().toISOString(),
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets user sync notice:", err);
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

export async function rejectVehicleInGoogleSheets(vehicleId: string) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reject_vehicle",
        vehicleId,
        approvalStatus: "rejected",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets vehicle rejection notice:", err);
    return { success: false };
  }
}

export async function approveHostInGoogleSheets(userId: string) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve_host",
        userId,
        hostStatus: "approved",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets host approval notice:", err);
    return { success: false };
  }
}

export async function rejectHostInGoogleSheets(userId: string) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reject_host",
        userId,
        hostStatus: "rejected",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets host rejection notice:", err);
    return { success: false };
  }
}

export async function updatePayoutStatusInGoogleSheets(
  bookingCode: string,
  payoutStatus: "Pending Settlement" | "Paid",
  payoutUtr?: string
) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_payout_status",
        bookingCode,
        payoutStatus,
        payoutUtr: payoutUtr || "",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets payout status update notice:", err);
    return { success: false };
  }
}

export async function fetchGoogleSheetsData() {
  try {
    const res = await fetch("/api/sheets", { method: "GET" });
    return await res.json();
  } catch (err) {
    console.warn("Google Sheets fetch notice:", err);
    return { success: false, vehicles: [], bookings: [], users: [] };
  }
}
