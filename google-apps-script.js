/**
 * =========================================================================
 * VED TRAVELS VADODARA — 100% ALL-IN-ONE GOOGLE APPS SCRIPT DATABASE
 * =========================================================================
 * 
 * 📌 SIRF YE EK HI FILE COPY KARNI HAI (Koi dusri file nahi chahiye):
 * 
 * STEP 1: Google Sheets kholo (https://sheets.new) aur name rakho: "Ved Travels DB".
 * STEP 2: Top menu me click karo: Extensions > Apps Script.
 * STEP 3: Editor me jo bhi pehle se likha ho sab delete karke ye pura code paste kar do.
 * STEP 4: (AUTOMATIC TABLE CREATION):
 *         Upar dropdown me "initialSetup" select karo aur "Run" button dabao!
 *         Aapke sheet me "Bookings" aur "Vehicles" dono tables instantly auto-create ho jayenge!
 * STEP 5: (WEB APP DEPLOY):
 *         Top-right me "Deploy" > "New deployment" par click karo.
 *         Select type (Gear ⚙️) > "Web app".
 *         Description: "Ved Travels Live API"
 *         Execute as: "Me"
 *         Who has access: "Anyone" (Ye zaroori hai taaki website se data aa sake)
 *         Click "Deploy" > Review Permissions > Advanced > Go to Untitled (unsafe) > Allow.
 * STEP 6: Copy Web App URL aur `.env.local` me paste karo:
 *         NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/XXXX/exec
 * 
 * =========================================================================
 */

/**
 * ⚡ 1-CLICK AUTO TABLE CREATOR
 * Apps Script me dropdown me "initialSetup" choose karke "Run" dabao.
 * Dono tables automatically ban jayenge!
 */
function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = setupDatabaseSheets(ss);

  // Agar default "Sheet1" empty hai toh use remove kar do
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  Logger.log("✅ Ved Travels Database Tables created successfully!");
  return "Success! Tables created.";
}

/**
 * Internal Database Initializer: Creates & formats tables automatically
 */
function setupDatabaseSheets(ss) {
  var spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();

  // 1. Ensure "Bookings" sheet exists with styled Emerald header
  var bookingsSheet = spreadsheet.getSheetByName("Bookings");
  if (!bookingsSheet) {
    bookingsSheet = spreadsheet.insertSheet("Bookings");
    bookingsSheet.appendRow([
      "Timestamp",
      "Booking ID",
      "Status",
      "Vehicle Name",
      "GJ-06 Plate",
      "Renter Name",
      "Renter Phone",
      "Start Date",
      "End Date",
      "Duration",
      "Base Rent (INR)",
      "Deposit (INR)",
      "Delivery Fee (INR)",
      "Total Amount (INR)",
      "Payment Mode",
      "UPI UTR / Ref Number",
      "4-Digit Start OTP",
      "Doorstep Delivery",
      "Delivery Address",
      "Pickup Hub"
    ]);

    // Emerald Green Header (#059669)
    var headerRange = bookingsSheet.getRange(1, 1, 1, 20);
    headerRange.setBackground("#059669");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    bookingsSheet.setRowHeight(1, 35);
    bookingsSheet.setFrozenRows(1);
  }

  // 2. Ensure "Vehicles" sheet exists with styled Slate Dark header
  var vehiclesSheet = spreadsheet.getSheetByName("Vehicles");
  if (!vehiclesSheet) {
    vehiclesSheet = spreadsheet.insertSheet("Vehicles");
    vehiclesSheet.appendRow([
      "Timestamp",
      "Vehicle ID",
      "Name",
      "Category",
      "Brand",
      "GJ-06 Plate",
      "Transmission",
      "Fuel",
      "Seats",
      "Mileage",
      "Hourly Rate (INR)",
      "Daily Rate (INR)",
      "Deposit (INR)",
      "Host Name",
      "Host ID",
      "Approval Status",
      "Image URL"
    ]);

    // Slate Dark Header (#0F172A)
    var vHeaderRange = vehiclesSheet.getRange(1, 1, 1, 17);
    vHeaderRange.setBackground("#0F172A");
    vHeaderRange.setFontColor("#FFFFFF");
    vHeaderRange.setFontWeight("bold");
    vHeaderRange.setHorizontalAlignment("center");
    vehiclesSheet.setRowHeight(1, 35);
    vehiclesSheet.setFrozenRows(1);
  }

  return { bookingsSheet: bookingsSheet, vehiclesSheet: vehiclesSheet };
}

/**
 * Handle POST requests from Website (Bookings, Host Vehicles, Status Updates)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupDatabaseSheets(ss);
    var data = {};

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "create_booking";
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    // -------------------------------------------------------------------------
    // CASE 1: Add New Customer Booking
    // -------------------------------------------------------------------------
    if (action === "create_booking") {
      sheets.bookingsSheet.appendRow([
        timestamp,
        data.bookingCode || ("VED-BK-" + Math.floor(1000 + Math.random() * 9000)),
        data.status || "confirmed_pay_at_hub",
        data.vehicleName || "",
        data.vehiclePlate || "",
        data.renterName || "",
        data.renterPhone || "",
        data.startDate || "",
        data.endDate || "",
        data.durationLabel || "",
        data.baseRent || 0,
        data.securityDeposit || 0,
        data.deliveryFee || 0,
        data.totalAmount || 0,
        data.paymentMode === "upi_advance" ? "UPI Advance" : "Pay at Vadodara Hub",
        data.upiUtr || "N/A (Pay at Hub)",
        data.otp || "",
        data.doorstepDelivery ? "Yes (+₹199)" : "No (Hub Pickup)",
        data.deliveryAddress || data.pickupLocation || "Vadodara Hub",
        data.pickupLocation || data.hubName || "Vadodara Railway Station"
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "Booking added to Google Sheet successfully",
          bookingCode: data.bookingCode,
          timestamp: timestamp
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------------------
    // CASE 2: Add New Host Vehicle
    // -------------------------------------------------------------------------
    if (action === "submit_vehicle") {
      sheets.vehiclesSheet.appendRow([
        timestamp,
        data.id || ("host-veh-" + new Date().getTime()),
        data.name || "",
        data.category || "bike",
        data.brand || "",
        data.plate || "",
        data.transmission || "Manual",
        data.fuel || "Petrol",
        data.seats || 2,
        data.mileage || "",
        data.hourlyRate || 0,
        data.dailyRate || 0,
        data.securityDeposit || 0,
        data.hostName || "Host Partner",
        data.hostId || "",
        data.approvalStatus || "pending_approval",
        (data.images && data.images[0]) || ""
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "Vehicle added to Google Sheet successfully",
          vehicleId: data.id,
          timestamp: timestamp
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------------------
    // CASE 3: Update Booking Status (e.g. UTR Verified / In-Trip)
    // -------------------------------------------------------------------------
    if (action === "update_booking_status") {
      var rows = sheets.bookingsSheet.getDataRange().getValues();
      var updated = false;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.bookingCode || rows[i][1] === data.bookingId) {
          sheets.bookingsSheet.getRange(i + 1, 3).setValue(data.status);
          updated = true;
          break;
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({
          success: updated,
          message: updated ? "Booking status updated" : "Booking not found"
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------------------
    // CASE 4: Admin Approve Vehicle
    // -------------------------------------------------------------------------
    if (action === "approve_vehicle") {
      var vRows = sheets.vehiclesSheet.getDataRange().getValues();
      var vUpdated = false;
      for (var j = 1; j < vRows.length; j++) {
        if (vRows[j][1] === data.vehicleId || vRows[j][5] === data.plate) {
          sheets.vehiclesSheet.getRange(j + 1, 16).setValue(data.approvalStatus || "approved");
          vUpdated = true;
          break;
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({
          success: vUpdated,
          message: vUpdated ? "Vehicle status updated" : "Vehicle not found"
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests (Reads live fleet and bookings if needed)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupDatabaseSheets(ss);

    // Read Vehicles
    var vRows = sheets.vehiclesSheet.getDataRange().getValues();
    var vehiclesList = [];
    for (var i = 1; i < vRows.length; i++) {
      var row = vRows[i];
      if (row[1]) {
        vehiclesList.push({
          id: String(row[1]),
          name: String(row[2]),
          category: String(row[3]),
          brand: String(row[4]),
          plate: String(row[5]),
          transmission: String(row[6]),
          fuel: String(row[7]),
          seats: Number(row[8]),
          mileage: String(row[9]),
          hourlyRate: Number(row[10]),
          dailyRate: Number(row[11]),
          securityDeposit: Number(row[12]),
          hostName: String(row[13]),
          approvalStatus: String(row[15]),
          available: String(row[15]) === "approved"
        });
      }
    }

    // Read Bookings
    var bRows = sheets.bookingsSheet.getDataRange().getValues();
    var bookingsList = [];
    for (var j = 1; j < bRows.length; j++) {
      var bRow = bRows[j];
      if (bRow[1]) {
        bookingsList.push({
          bookingCode: String(bRow[1]),
          status: String(bRow[2]),
          vehicleName: String(bRow[3]),
          vehiclePlate: String(bRow[4]),
          renterName: String(bRow[5]),
          renterPhone: String(bRow[6]),
          startDate: String(bRow[7]),
          totalAmount: Number(bRow[13]),
          paymentMode: String(bRow[14]),
          upiUtr: String(bRow[15]),
          otp: String(bRow[16])
        });
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        source: "Ved Travels Database",
        vehicles: vehiclesList,
        bookings: bookingsList
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
