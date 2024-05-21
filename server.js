// const getMacAddress = require("./helper.js");

// Import necessary modules
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const { login, addUser, isLoggedIn, ab, isAdmin } = require("./services/authentication_service.js");
const { getIntersect } = require("./services/helper_service.js");
const { getLogs, logInDatabase } = require("./services/log_service.js");

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
		"CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, password TEXT, role TEXT, wardnumber INTEGER)"
	);
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

ADMIN_SET = `Name,BedNumber,RoomNumber,WardNumber,Disease,Medication,WardIncharge,AdmissionDate,Nurse,LastExaminer,PhoneNumber,Address,TotalEstimatedCost,TotalPayment,BalanceDue,AdvancePayment,VIP,StaffQuota,DischargeDate`;
BACKOFFICE_SET = `Name,BedNumber,RoomNumber,WardNumber,WardIncharge,AdmissionDate,Nurse,LastExaminer,PhoneNumber,Address,TotalEstimatedCost,TotalPayment,BalanceDue,AdvancePayment,VIP,StaffQuota,DischargeDate`;
DOCTOR_SET = `Name,BedNumber,RoomNumber,WardNumber,Disease,Medication,WardIncharge,AdmissionDate,Nurse,LastExaminer,PhoneNumber,Address,VIP,StaffQuota,DischargeDate`;
NURSE_SET = `Name,BedNumber,RoomNumber,WardNumber,Disease,Medication,AdmissionDate,Nurse,LastExaminer,PhoneNumber,VIP,StaffQuota,DischargeDate`
CLERK_SET = `Name,BedNumber,RoomNumber,WardNumber,AdmissionDate,Nurse,LastExaminer,PhoneNumber,DischargeDate`;
ACCOUNTS_SET = `Name,BedNumber,RoomNumber,WardNumber,AdmissionDate,PhoneNumber,TotalEstimatedCost,TotalPayment,BalanceDue,AdvancePayment,VIP,StaffQuota,DischargeDate`;



// Define routes

// Get all users
app.get("/api/patients", (req, res) => {
	role = req.body.role;
	console.log("role is ", role);
	switch (role) {
		case "backoffice":
			// nurse_name = req.body.nurse_name;
			db.all(`SELECT ${BACKOFFICE_SET} FROM patients`, (err, rows) => {
				if (err) {
					console.error(err.message);
					res.status(500).json({ error: "Internal server error" });
				} else {
					res.json({ cols: ACCOUNTS_SET.split(","), data: rows });
				}
			});
			break;

		case "doctor":
			const doctor_name = req.body.name;
			const doctor_email = req.body.email;
			// const doctor_columns = req.body.columns;
			if (!isLoggedIn(doctor_email, req.ip)) {
				return res.status(401).json({ error: "Unauthorized" });
			}
			// const final_set_doctor = getIntersect(DOCTOR_SET,doctor_columns);
			const final_set_doctor = DOCTOR_SET;
			db.all(
				`SELECT ${final_set_doctor} FROM patients WHERE LastExaminer="${doctor_name}"`,
				(err, rows) => {
					if (err) {
						console.error(err.message);
						res.status(500).json({ error: "Internal server error" });
					} else {
						res.json({ cols: DOCTOR_SET.split(","), data: rows });
					}
				}
			);
			break;

		case "nurse":
			const nurse_email = req.body.name;
			const nurse_columns = req.body.columns;
			if (!isLoggedIn(nurse_email, req.ip)) {
				return res.status(401).json({ error: "Unauthorized" });
			}
			// const final_set_nurse = getIntersect(NURSE_SET,nurse_columns);
			const final_set_nurse = NURSE_SET;
			db.all(
				`SELECT ${final_set_nurse} FROM patients WHERE Nurse="${nurse_name}"`,
				(err, rows) => {
					if (err) {
						console.error(err.message);
						res.status(500).json({ error: "Internal server error" });
					} else {
						res.json({ cols: NURSE_SET.split(","), data: rows });
					}
				}
			);
			break;

		case "clerk":
			const clerk_email = req.body.name;
			// const clerk_columns = req.body.columns;
			if (!isLoggedIn(clerk_email, req.ip)) {
				return res.status(401).json({ error: "Unauthorized" });
			}
			// const final_set_clerk = getIntersect(CLERK_SET,clerk_columns);
			const final_set_clerk = CLERK_SET;
			db.all(`SELECT ${final_set_clerk} FROM patients`, (err, rows) => {
				if (err) {
					console.error(err.message);
					res.status(500).json({ error: "Internal server error" });
				} else {
					res.json({ cols: CLERK_SET.split(","), data: rows });
				}
			});
			break;

		case "accounts":
			// nurse_name = req.body.nurse_name;
			db.all(`SELECT ${ACCOUNTS_SET} FROM patients`, (err, rows) => {
				if (err) {
					console.error(err.message);
					res.status(500).json({ error: "Internal server error" });
				} else {
					res.json({ cols: ACCOUNTS_SET.split(","), data: rows });
				}
			});
			break;

		default:
			console.log("Default Case");
			db.all(`SELECT ${DOCTOR_SET} FROM patients`, (err, rows) => {
				if (err) {
					console.error(err.message);
					res.status(500).json({ error: "Internal server error" });
				} else {
					res.json(rows);
				}
			});
			break;
		// res.status(300).json({ error: "Unauthorised" });
		// break;
	}
});

// SIGN UP
app.post("/api/users/signup", async (req, res) => {
	const { name, email, password, role, wardnumber } = req.body;
	if (req.body.wardnumber) {
		const wardnumber = req.body.wardnumber;
	}
	if (!email && !password && !role && email.length == 0) {
		res.status(400).json({ error: "Name, Email, Password, Role is required" });
	} else {
		const ip = req.ip;
		const msg = await addUser(name, email, password, role, ip, wardnumber);
		res.status(201).json(msg);
	}
});

// LOG IN
app.get("/api/users/login", async (req, res) => {
	const { name, email, password, role } = req.body;
	if (!name && !email && !password && !role && email.length == 0) {
		res.status(400).json({ error: "Name, Email, Password, Role is required" });
	} else {
		const msg = await login(name, email, password, role);
		res.status(201).json(msg);
	}
});

// Get logs
app.get("/api/admin/getlogs", async (req, res) => {
	if (!isAdmin(req.body.adminKey)) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	const logs = await getLogs();
	res.json(logs);
});

// Get all users
app.get("/api/admin/getusers/", (req, res) => {
	if (!isAdmin(req.body.adminKey)) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	db.all("SELECT * FROM users", (err, row) => {
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

// ADMIN DELETE USER
app.get("/api/admin/deleteuser", async (req, res) => {
	if (!isAdmin(req.body.adminKey)) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	db.all(`DELETE FROM users where email="${req.body.email}"`, (err, row) => {
		if (err) {
			console.error(err.message);
			res.status(500).json({ error: "Internal server error" });
		} else {
			res.json({code:"ud", msg:"User deleted successfully"});
		}
	});
});

// Get all patients
app.get("/api/admin/getpatients/", (req, res) => {
	if (!isAdmin(req.body.adminKey)) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	db.all("SELECT * FROM patients", (err, rows) => {
		if (err) {
			console.error(err.message);
			res.status(500).json({ error: "Internal server error" });
		} else if (!rows) {
			res.status(404).json({ error: "No user found" });
		} else {
			res.json({cols: ADMIN_SET.split(","), data: rows});
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
