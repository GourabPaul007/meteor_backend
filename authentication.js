const sqlite3 = require("sqlite3").verbose();
const {getMacAddress, logInDatabase} = require("./helper.js");

// Define an object to store logged-in users
const loggedInUsers = {};
const db1 = new sqlite3.Database("database.db");

// Function to add a new user
const login = async (name, email, password, role, ip) => {
    const checkUserExistsInDB = await userExistsInDB(name, email, password, role);
    console.log("checkUserExistsInDB", checkUserExistsInDB);
    if(checkUserExistsInDB==false){
        console.log("user does not exist in DB");
        return "user does not exist in DB";
    }
    if (loggedInUsers[name]) {
        console.log('User with this name is already logged in.');
        return 'User with this name is already logged in.';
    } else {
        loggedInUsers[name] = { name, name, password, role };
        console.log('USER LOGGED IN:', loggedInUsers[name]);

        // Set timeout to remove user after 10 minutes
        setTimeout(() => {
            delete loggedInUsers[name];
            console.log(`User ${name} has been logged out.`);
        }, 10 * 60 * 1000); // 10 minutes in milliseconds

        return 'USER LOGGED IN:', loggedInUsers[name];
    }
};

const isLoggedIn = (name) => {
    console.log("inside isLoggedIn, name is ", name);
    if(loggedInUsers[name]){
        console.log("true");
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

const ab = () => {
    console.log("ab");
}

// const addUser = async (name, email, password, role, ipAddress) => {
//     console.log("123");
//     if(await userExistsInDB(name, email, password, role)){
//         console.log("user already exists in DB");
//         return "user already exists in DB";
//     }
//     else{
//         db1.run(
//             "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//             [name, email, password, role],
//             async function (err) {
//                 if (err) {
//                     console.error(err.message);
//                     console.log({ error: "Internal server error" });
//                 } else {
//                     // const macAddress = getMacAddress(ipAddress);
//                     const macAddress = "::1";
//                     const ts = new Date(new Date().getTime())
//                     const logData = `${ts} - ${name} with role ${role} signed up - IP Address: ${ipAddress} MAC Address: ${macAddress}`;
//                     console.log("logData - ", logData);
//                     await logInDatabase(logData);
//                 }
//             }
//         );
//         console.log("user added to DB");
//         return "user added to DB";
//     }
// }

const addUser = async (name, email, password, role, ipAddress) => {
    console.log("123");
    if (await userExistsInDB(name, email, password, role)) {
        console.log("user already exists in DB");
        return "user already exists in DB";
    } else {
        return new Promise((resolve, reject) => {
            db1.run(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, password, role],
                async function (err) {
                    if (err) {
                        console.error(err.message);
                        console.log({ error: "Internal server error" });
                        reject("Internal server error");
                    } else {
                        // const macAddress = getMacAddress(ipAddress);
                        const macAddress = "::1";
                        const ts = new Date().toLocaleString();
                        const logData = `${ts} - ${name} with role ${role} signed up - IP Address: ${ipAddress} MAC Address: ${macAddress}`;
                        console.log("logData - ", logData);
                        await logInDatabase(logData);
                        console.log("user added to DB");
                        resolve("user added to DB");
                    }
                }
            );
        });
    }
};

// Function to authenticate user
const userExistsInDB = async (name, email, password, role) => {
    return new Promise((resolve, reject) => {
        name = name.trim();
        console.log("inside userExistsInDB, name is", name);
        db1.all(
            // `SELECT * FROM users WHERE name=${name} AND email=${email} AND password=${password} AND role=${role};`,
            `SELECT * FROM users WHERE name="${name}" AND role="${role}";`,
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return false;
                } 
                console.log("rows => ", rows);
                if(rows.length > 0) {
                    resolve(true); // Resolve with true if user exists
                }else {
                    resolve(false); // Resolve with false if user doesn't exist
                }
            }
        );
    });
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

module.exports = {login, addUser, isLoggedIn, ab};