const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const csvParser = require('csv-parser');

// SQLite database file
const dbFile = 'database.db';

// CSV file path
const csvFilePath = './HospitalData.csv';

// Create a SQLite database connection
const db = new sqlite3.Database(dbFile);

// Define the table schema
// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS patients (
//     ID INTEGER PRIMARY KEY,
//     Name TEXT,
//     BedNumber INTEGER,
//     RoomNumber INTEGER,
//     AdmissionDate TEXT,
//     Nurse TEXT,
//     LastExaminer TEXT,
//     PhoneNumber TEXT,
//     Address TEXT,
//     TotalEstimatedCost REAL,
//     TotalPayment REAL,
//     BalanceDue REAL,
//     AdvancePayment REAL,
//     VIP TEXT,
//     StaffQuota TEXT,
//     DischargeDate TEXT
//   )
// `;

const createTableQuery = 
`CREATE TABLE Patients (
  Id INTEGER PRIMARY KEY,
  Name TEXT NOT NULL,
  BedNumber INTEGER,
  RoomNumber INTEGER,
  WardNumber INTEGER,
  Disease TEXT,
  Medication TEXT,
  WardIncharge TEXT,
  AdmissionDate DATE,
  Nurse TEXT,
  LastExaminer TEXT,
  PhoneNumber TEXT,
  Address TEXT,
  TotalEstimatedCost REAL,
  TotalPayment REAL,
  BalanceDue REAL,
  AdvancePayment REAL,
  VIP TEXT CHECK(VIP IN ('Yes', 'No')),
  StaffQuota TEXT CHECK(StaffQuota IN ('Yes', 'No')),
  DischargeDate DATE
);`

// Execute the table creation query
db.run(createTableQuery, function(err) {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Table created successfully.');

    // Read the CSV file and insert data into the 'patients' table
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Prepare the SQL query to insert data
        // const insertQuery = `
        //   INSERT INTO patients (Name, BedNumber, RoomNumber, AdmissionDate, Nurse, LastExaminer, PhoneNumber, Address, TotalEstimatedCost, TotalPayment, BalanceDue, AdvancePayment, VIP, StaffQuota, DischargeDate)
        //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        // `;
        const insertQuery = `
        INSERT INTO Patients (
          Name,
          BedNumber,
          RoomNumber,
          WardNumber,
          Disease,
          Medication,
          WardIncharge,
          AdmissionDate,
          Nurse,
          LastExaminer,
          PhoneNumber,
          Address,
          TotalEstimatedCost,
          TotalPayment,
          BalanceDue,
          AdvancePayment,
          VIP,
          StaffQuota,
          DischargeDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // Exclude the auto-incrementing primary key 'ID' column from data
        const values = Object.values(data);
        values.shift(); // Remove the first value (ID)
        // Log the data being inserted and the SQL query
        console.log('Data:', Object.values(data));
        console.log('Query:', insertQuery);
        // Execute the insert query with data from the CSV
        db.run(insertQuery, values, function(err) {
            if (err) {
              console.error('Error inserting data:', err.message);
            } else {
              console.log(`A new row has been inserted with ID ${this.lastID}`);
            }
          });
      })
      .on('end', () => {
        console.log('Data imported successfully.');
        
        // Close the database connection
        db.close();
      });
  }
});
