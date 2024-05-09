const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const csvParser = require('csv-parser');

// SQLite database file
const dbFile = 'database.db';

// CSV file path
const csvFilePath = './wardDetails.csv';

// Create a SQLite database connection
const db = new sqlite3.Database(dbFile);

// Define the table schema
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS wards (WardNumber INTEGER PRIMARY KEY, WardIncharge TEXT)
`;

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
        const insertQuery = `
          INSERT INTO wards (WardNumber, WardIncharge)
          VALUES (?, ?)
        `;
        // Exclude the auto-incrementing primary key 'ID' column from data
        const values = Object.values(data);
        values.forEach((value) => {
            console.log(value);
        })
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
