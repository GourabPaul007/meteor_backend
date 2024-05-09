const getMacAddress = require("./helper.js");
const logInDatabase = require("./helper.js");

const login = require("./login.js");
const signup = require("./login.js");
const isLoggedIn = require("./login.js");

// Import necessary modules
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Create SQLite database connection
const db = new sqlite3.Database("database.db"); // Change to file path for persistent storage
const ADMIN_KEY = "1234";

// Create a table
db.serialize(() => {
	db.run(
		"CREATE TABLE IF NOT EXISTS wards (WardNumber INTEGER PRIMARY KEY, WardIncharge TEXT)"
	);
	db.run("CREATE TABLE IF NOT EXISTS logs (logData TEXT)");
	db.run(
		"CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, password TEXT, role TEXT)"
	);
	//   -- Create a SQLite database
	db.run(`CREATE TABLE IF NOT EXISTS patients (
        ID INTEGER PRIMARY KEY,
        Name TEXT,
        BedNumber INTEGER,
        RoomNumber INTEGER,
        AdmissionDate TEXT,
        Nurse TEXT,
        LastExaminer TEXT,
        PhoneNumber TEXT,
        Address TEXT,
        TotalEstimatedCost REAL,
        TotalPayment REAL,
        BalanceDue REAL,
        AdvancePayment REAL,
        VIP TEXT,
        StaffQuota TEXT,
        DischargeDate TEXT
      )`);
	// db.run(`DESC patients`);
});

const saveDB = () => {
	// Create a backup of the SQLite database
	const fs = require("fs");
	// Assuming your SQLite database file is named 'database.db'
	const sourcePath = "database.db";
	const destinationPath = "backup_database.db";
	fs.copyFile(sourcePath, destinationPath, (err) => {
		if (err) {
			console.error("Error copying database:", err);
		} else {
			console.log("Database copied successfully.");
		}
	});
};

ADMIN_SET = `*`;
BACKOFFICE_SET = `Name,BedNumber,RoomNumber,AdmissionDate,Nurse,LastExaminer,PhoneNumber,Address,TotalEstimatedCost,TotalPayment,BalanceDue,AdvancePayment,VIP,StaffQuota,DischargeDate`;
DOCTOR_SET = `Name,BedNumber,RoomNumber,AdmissionDate,Nurse,LastExaminer,PhoneNumber,Address,VIP,StaffQuota,DischargeDate`;
CLERK_SET = `Name,BedNumber,RoomNumber,AdmissionDate,Nurse,PhoneNumber,DischargeDate`;
ACCOUNTS_SET = `Name,BedNumber,RoomNumber,AdmissionDate,TotalEstimatedCost,TotalPayment,BalanceDue,AdvancePayment,DischargeDate`;

// Define routes

// Get all users
app.get("/api/patients", (req, res) => {
	role = req.query.role;
	if(!isLoggedIn(req.body.email)){
		res.status(401).json({ error: "Unauthorized" });
	}
	console.log(role);
	switch (role) {
		case "nurse":
			nurse_name = req.body.nurse_name;
			db.all(
				`SELECT ${DOCTOR_SET} FROM patients WHERE Nurse="${nurse_name}"`,
				(err, rows) => {
					if (err) {
						console.error(err.message);
						res.status(500).json({ error: "Internal server error" });
					} else {
						res.json(rows);
					}
				}
			);
			break;

		case "doctor":
			doctor_name = req.body.doctor_name;
			console.log(doctor_name);
			db.all(
				`SELECT ${DOCTOR_SET} FROM patients WHERE LastExaminer="${doctor_name}"`,
				(err, rows) => {
					if (err) {
						console.error(err.message);
						res.status(500).json({ error: "Internal server error" });
					} else {
						res.json(rows);
					}
				}
			);
			break;

		case "clerk":
			// nurse_name = req.query.nurse_name;
			db.all(`SELECT ${CLERK_SET} FROM patients`, (err, rows) => {
				if (err) {
					console.error(err.message);
					res.status(500).json({ error: "Internal server error" });
				} else {
					res.json(rows);
				}
			});
			break;

		case "accounts":
			// nurse_name = req.query.nurse_name;
			db.all(`SELECT ${ACCOUNTS_SET} FROM patients`, (err, rows) => {
				if (err) {
					console.error(err.message);
					res.status(500).json({ error: "Internal server error" });
				} else {
					res.json(rows);
				}
			});
			break;

		default:
			res.status(300).json({ error: "Unauthorised" });
			break;
	}
});

// SIGN UP
app.post("/api/users/signup", async (req, res) => {
	const { name, email, password, role } = req.body;
	console.log("SignUp request: ", name, email, password, role);
	if (!email && !password && !role && email.length == 0) {
		res.status(400).json({ error: "Email, Password, Role is required" });
	} else {
		ip = req.ip
		signup(name, email, password, role, ip);
		console.log("SignUp done: ", name, email, password, role);
		res.status(201).json({ name, email, password, role, ip });
	}
});

// LOG IN
app.get("/api/users/login", async (req, res) => {
	const { name, email, password, role } = req.body;
	if (!name && !email && !password && !role && email.length == 0) {
		res.status(400).json({ error: "Name, Email, Password, Role is required" });
	} else {
		login(name, email, password, role);
        res.status(201).json({ name, email, role });
	}
});

// Get logs
app.get("/api/admin/getlogs", (req, res) => {
	const { id } = req.body;
	db.all("SELECT * FROM logs", (err, rows) => {
		console.log(rows);
		if (err) {
			console.error(err.message);
			res.status(500).json({ error: "Internal server error" });
		} else {
			res.json(rows);
		}
	});
});

// Get all users
app.get("/api/users/", (req, res) => {
	db.get("SELECT * FROM users", (err, row) => {
		if (err) {
			console.error(err.message);
			res.status(500).json({ error: "Internal server error" });
		} else if (!row) {
			res.status(404).json({ error: "No user found" });
		} else {
			res.json(row);
		}
	});
});

// // Get a single user by ID
// app.get("/api/users/:id", (req, res) => {
// 	const { id } = req.params;
// 	db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
// 		if (err) {
// 			console.error(err.message);
// 			res.status(500).json({ error: "Internal server error" });
// 		} else if (!row) {
// 			res.status(404).json({ error: "User not found" });
// 		} else {
// 			res.json(row);
// 		}
// 	});
// });

// // Create a new user
// app.post("/api/users", (req, res) => {
// 	const { name } = req.body;
// 	if (!name) {
// 		res.status(400).json({ error: "Name is required" });
// 	} else {
// 		db.run("INSERT INTO users (name) VALUES (?)", [name], function (err) {
// 			if (err) {
// 				console.error(err.message);
// 				res.status(500).json({ error: "Internal server error" });
// 			} else {
// 				res.status(201).json({ id: this.lastID, name });
// 			}
// 		});
// 	}
// });

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
