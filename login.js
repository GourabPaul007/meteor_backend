const sqlite3 = require("sqlite3").verbose();
const getMacAddress = require("./helper.js");
const logInDatabase = require("./helper.js");



// Define an object to store user details
const users = {};

// // Function to add a new user
// const addUser = (name, email, password, role) => {
//     if (users[email]) {
//         console.log('User with this email already exists.');
//         return false;
//     } else {
//         users[email] = { name, email, password, role };
//         console.log('User added successfully:', users[email]);
//         return true;
//     }
// };

// Define an object to store logged-in users
const loggedInUsers = {};
const db1 = new sqlite3.Database("database.db");

// Function to add a new user
const login = (name, email, password, role, ip) => {
    if(!userExistsInDB(name, email, password, role)){
        reutrn
    }
    if (loggedInUsers[email]) {
        console.log('User with this email is already logged in.');
        return false;
    } else {
        loggedInUsers[email] = { name, email, password, role };
        console.log('User added successfully:', loggedInUsers[email]);

        // Set timeout to remove user after 10 minutes
        setTimeout(() => {
            delete loggedInUsers[email];
            console.log(`User ${email} has been logged out.`);
        }, 1/6 * 60 * 1000); // 10 minutes in milliseconds

        return true;
    }
};

const isLoggedIn = (email) => {
    if(loggedInUsers[email]){
        return true;
    }else{
        return false;
    }
}

// const addUser = (name, email, password, role) => {
//     const stmt = db.prepare("INSERT INTO Users (Name, Email, Password, Role) VALUES (?, ?, ?, ?)");
//     stmt.run(name, email, password, role, function(err) {
//         if (err) {
//             console.error(err.message);
//             console.log('Error adding user.');
//             return false;
//         }
//         console.log('User added successfully:', { name, email, password, role });
//         return true;
//     });
//     stmt.finalize();
// };

const signup = (name, email, password, role, ipAddress) => {
    if(userExistsInDB(name, email, password, role)){
        console.log("user exists in DB");
        return;
    }

    // const stmt = db1.prepare("INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)");
    // stmt.run(name, email, password, role, function(err) {
    //     if (err) {
    //         console.error(err.message);
    //         console.log('Error adding user.');
    //         return false;
    //     }
    //     console.log('User added successfully:', { name, email, password, role });
    //     return true;
    // });
    // stmt.finalize();
    // const macAddress = getMacAddress(ipAddress);
    // const ts = new Date(new Date().getTime())
    // const logData = `${ts} - ${email} with role ${role} signed up - IP Address: ${ipAddress} MAC Address: ${macAddress}`;
    // console.log("logData - ", logData);
    // logInDatabase(logData);


    db1.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role],
        function (err) {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: "Internal server error" });
            } else {
                const macAddress = getMacAddress(ipAddress);
                const ts = new Date(new Date().getTime())
                const logData = `${ts} - ${email} with role ${role} signed up - IP Address: ${ipAddress} MAC Address: ${macAddress}`;
                console.log("logData - ", logData);
                logInDatabase(logData);
            }
        }
    );
}

// Function to authenticate user
const userExistsInDB = (name, email, password, role) => {
    db1.run(
        `SELECT * FROM users WHERE name=${name} AND email=${email} AND password=${password} AND role=${role};`,
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return false;
            } else {
                console.log(rows);
                return true;
            }
        }
    );
    return false;

    // const user = users[email];
    // if (user && user.password === password) {
    //     return user;
    // } else {
    //     return null;
    // }
};

// Usage example
// login('John Doe', 'john@example.com', 'password123', 'admin');
// login('Alice Smith', 'alice@example.com', 'secret456', 'user');

// const user = userExistsInDB('john@example.com', 'password123');
// if (user) {
//     console.log('Authentication successful:', user);
// } else {
//     console.log('Authentication failed. Invalid email or password.');
// }

module.exports = login;
module.exports = signup;
module.exports = isLoggedIn;