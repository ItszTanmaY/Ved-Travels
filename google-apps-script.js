/**
 * =========================================================================
 * VED TRAVELS VADODARA — 100% ALL-IN-ONE GOOGLE APPS SCRIPT DATABASE (v2)
 * =========================================================================
 * 
 * Includes 3 Core Production Tables:
 * 1. "Bookings" — Real client reservations, OTPs, slab details, payment modes
 * 2. "Vehicles" — Fleet inventory & newly submitted Host Partner vehicles
 * 3. "Users"    — Registered Customers, Host Partners (with approval states)
 * 
 * 📌 STEP 1: Google Sheets kholo (https://sheets.new) aur name rakho: "Ved Travels DB".
 * 📌 STEP 2: Top menu me click karo: Extensions > Apps Script.
 * 📌 STEP 3: Sab delete karke ye code paste kar do.
 * 📌 STEP 4: "initialSetup" select karo aur "Run" dabao (Dono 3 tables auto create ho jayenge).
 * 📌 STEP 5: "Deploy" > "New deployment" > Web app (Execute as Me, Access: Anyone).
 * 📌 STEP 6: Web App URL copy karke .env.local me paste karo.
 * =========================================================================
 */

function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = setupDatabaseSheets(ss);

  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  Logger.log("✅ Ved Travels Database Tables (Bookings, Vehicles, Users) created successfully!");
  return "Success! Tables created.";
}

function setupDatabaseSheets(ss) {
  var spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();

  // 1. "Bookings" Table
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
      "Pickup Hub",
      "DL Photo Status",
      "Host Name"
    ]);

    var headerRange = bookingsSheet.getRange(1, 1, 1, 22);
    headerRange.setBackground("#059669");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    bookingsSheet.setRowHeight(1, 35);
    bookingsSheet.setFrozenRows(1);
  }

  // 2. "Vehicles" Table
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
      "Image Reference"
    ]);

    var vHeaderRange = vehiclesSheet.getRange(1, 1, 1, 17);
    vHeaderRange.setBackground("#0F172A");
    vHeaderRange.setFontColor("#FFFFFF");
    vHeaderRange.setFontWeight("bold");
    vHeaderRange.setHorizontalAlignment("center");
    vehiclesSheet.setRowHeight(1, 35);
    vehiclesSheet.setFrozenRows(1);
  }

  // 3. "Users" Table
  var usersSheet = spreadsheet.getSheetByName("Users");
  if (!usersSheet) {
    usersSheet = spreadsheet.insertSheet("Users");
    usersSheet.appendRow([
      "Timestamp",
      "User ID",
      "Full Name",
      "Phone",
      "Email",
      "Role",
      "Host Status",
      "KYC Status",
      "DL Number",
      "Aadhaar Number",
      "Created Date"
    ]);

    var uHeaderRange = usersSheet.getRange(1, 1, 1, 11);
    uHeaderRange.setBackground("#D97706");
    uHeaderRange.setFontColor("#FFFFFF");
    uHeaderRange.setFontWeight("bold");
    uHeaderRange.setHorizontalAlignment("center");
    usersSheet.setRowHeight(1, 35);
    usersSheet.setFrozenRows(1);
  }

  return { bookingsSheet: bookingsSheet, vehiclesSheet: vehiclesSheet, usersSheet: usersSheet };
}

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

    // CASE 1: Add New Customer Booking
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
        data.paymentMode === "upi_advance" ? "UPI Advance" : "Pay at Vadodara Hub / WhatsApp",
        data.upiUtr || "N/A",
        data.otp || "",
        data.doorstepDelivery ? "Yes (+INR 199)" : "No (Hub Pickup)",
        data.deliveryAddress || data.pickupLocation || "Vadodara Hub",
        data.pickupLocation || data.hubName || "Vadodara Railway Station",
        data.dlUploaded || (data.dlPhotoUrl ? "Photo Attached" : "Pending at Hub"),
        data.hostName || "Ved Fleet Hub"
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

    // CASE 2: Register New User / Host
    if (action === "register_user") {
      sheets.usersSheet.appendRow([
        timestamp,
        data.id || ("user-" + new Date().getTime()),
        data.name || "",
        data.phone || "",
        data.email || "",
        data.role || "renter",
        data.hostStatus || (data.role === "host" ? "pending_approval" : "approved"),
        data.kycStatus || "unverified",
        data.dlNumber || "",
        data.aadhaarNumber || "",
        data.createdAt || timestamp
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "User registered in Google Sheet",
          userId: data.id
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // CASE 3: Add New Host Vehicle
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
        (data.images && data.images[0]) ? "Photo Uploaded" : ""
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "Vehicle added to Google Sheet successfully",
          vehicleId: data.id
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // CASE 4: Update Booking Status
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
        JSON.stringify({ success: updated, message: updated ? "Booking status updated" : "Booking not found" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // CASE 5: Approve Vehicle
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
        JSON.stringify({ success: vUpdated, message: vUpdated ? "Vehicle approved" : "Vehicle not found" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // CASE 6: Reject Vehicle
    if (action === "reject_vehicle") {
      var rRows = sheets.vehiclesSheet.getDataRange().getValues();
      var rUpdated = false;
      for (var k = 1; k < rRows.length; k++) {
        if (rRows[k][1] === data.vehicleId || rRows[k][5] === data.plate) {
          sheets.vehiclesSheet.getRange(k + 1, 16).setValue("rejected");
          rUpdated = true;
          break;
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ success: rUpdated, message: rUpdated ? "Vehicle rejected" : "Vehicle not found" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // CASE 7: Approve Host Account
    if (action === "approve_host") {
      var uRows = sheets.usersSheet.getDataRange().getValues();
      var uUpdated = false;
      for (var u = 1; u < uRows.length; u++) {
        if (uRows[u][1] === data.userId || uRows[u][3] === data.phone || uRows[u][4] === data.email) {
          sheets.usersSheet.getRange(u + 1, 7).setValue("approved");
          uUpdated = true;
          break;
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ success: uUpdated, message: uUpdated ? "Host approved" : "Host not found" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // CASE 8: Reject Host Account
    if (action === "reject_host") {
      var uhRows = sheets.usersSheet.getDataRange().getValues();
      var uhUpdated = false;
      for (var uh = 1; uh < uhRows.length; uh++) {
        if (uhRows[uh][1] === data.userId || uhRows[uh][3] === data.phone || uhRows[uh][4] === data.email) {
          sheets.usersSheet.getRange(uh + 1, 7).setValue("rejected");
          uhUpdated = true;
          break;
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ success: uhUpdated, message: uhUpdated ? "Host rejected" : "Host not found" })
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
          otp: String(bRow[16]),
          pickupHub: String(bRow[19])
        });
      }
    }

    // Read Users
    var uRows = sheets.usersSheet.getDataRange().getValues();
    var usersList = [];
    for (var u = 1; u < uRows.length; u++) {
      var uRow = uRows[u];
      if (uRow[1]) {
        usersList.push({
          id: String(uRow[1]),
          name: String(uRow[2]),
          phone: String(uRow[3]),
          email: String(uRow[4]),
          role: String(uRow[5]),
          hostStatus: String(uRow[6]),
          kycStatus: String(uRow[7])
        });
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        source: "Ved Travels Database",
        vehicles: vehiclesList,
        bookings: bookingsList,
        users: usersList
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
