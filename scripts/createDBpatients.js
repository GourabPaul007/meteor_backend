const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const csvParser = require('csv-parser');

// Path to the CSV file
const csvFilePath = './allDetails.csv';
// Create a SQLite database instance
const db = new sqlite3.Database('database.db');
// Function to create the patients table
function createPatientsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT,
        BedNumber TEXT,
        RoomNumber TEXT,
        WardNumber TEXT,
        Disease TEXT,
        Medication TEXT,
        WardIncharge TEXT,
        AdmissionDate TEXT,
        Nurse TEXT,
        LastExaminer TEXT,
        PhoneNumber TEXT,
        Address TEXT,
        TotalEstimatedCost REAL,
        TotalPayment REAL,
        BalanceDue REAL,
        AdvancePayment REAL,
        VIP INTEGER,
        StaffQuota INTEGER,
        DischargeDate TEXT
    )`);
}
// Function to insert data from CSV into the patients table
function insertDataFromCSV() {
  fs.createReadStream(csvFilePath)
      .pipe(csvParser({ columns: true }))
      .on('data', (data) => {
          const values = Object.values(data);
          values.shift(); // Remove the first value (ID)
          db.run(`INSERT INTO patients (Name, BedNumber, RoomNumber, WardNumber, Disease, Medication, WardIncharge, AdmissionDate, Nurse, LastExaminer, PhoneNumber, Address, TotalEstimatedCost, TotalPayment, BalanceDue, AdvancePayment, VIP, StaffQuota, DischargeDate) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values, (err) => {
              if (err) {
                  console.error('Error inserting data:', err);
              }
          });
      })
      .on('end', () => {
          console.log('Data has been successfully inserted into the patients table.');
          db.close();
      });
}
// Create patients table and insert data from CSV
db.serialize(() => {
  createPatientsTable();
  insertDataFromCSV();
});