const sqlite3 = require("sqlite3").verbose();
const {getMacAddress} = require("./helper_service.js");
const {logInDatabase} = require("./log_service.js");

// Define an object to store logged-in users
const loggedInUsers = {};
const db1 = new sqlite3.Database("database.db");

// Function to add a new user
const login = async (name, email, password, role, ipAddress) => {
    const checkUserExistsInDB = await userExistsInDB(name, email, password, role);
    console.log("checkUserExistsInDB", checkUserExistsInDB);
    // IF USER DOES NOT EXIST IN DTABASE
    if(checkUserExistsInDB==false){
        console.log("user does not exist in DB");
        const logData = `${new Date().toLocaleString()} - ${email} with role ${role} tried logging in, user does not exist in DB - IP Address: ${ipAddress} MAC Address: ${ipAddress}`;
        logInDatabase(logData);
        return {code:"udne", msg:"user does not exist in DB"};
    }
    // IF USER ALREADY LOGGED IN
    if (loggedInUsers[email]) {
        console.log('user with this email is already logged in.');
        const logData = `${new Date().toLocaleString()} - ${email} with role ${role} tried logging in, but user with this email is already logged in - IP Address: ${ipAddress} MAC Address: ${ipAddress}`;
        logInDatabase(logData);
        const msg = 'user with this email is already logged in: ' + loggedInUsers[email];
        return {code:"uali", msg:msg};
    }
    // NORMAL LOG IN
    else {
        loggedInUsers[email] = { email, name, password, role };
        console.log('USER LOGGED IN:', loggedInUsers[email]);
        // Set timeout to remove user after 10 minutes
        setTimeout(() => {
            const logData = `${new Date().toLocaleString()} - ${email} with role ${role} has been logged out - IP Address: ${ipAddress} MAC Address: ${ipAddress}`;
            logInDatabase(logData);
            delete loggedInUsers[email];
            console.log(`User ${email} has been logged out.`);
        }, 10 * 60 * 1000); // 10 minutes in milliseconds

        const logData = `${new Date().toLocaleString()} - ${email} with role ${role} logged in - IP Address: ${ipAddress} MAC Address: ${ipAddress}`;
        logInDatabase(logData);

        const res = {code:"uli", msg:'user logged in: ' + loggedInUsers[email].email};
        return res;
    }
};

const isLoggedIn = (email, ipAddress) => {
    // IF USER IS LOGGED IN
    if(loggedInUsers[email]){
        const logData = `${new Date().toLocaleString()} - ${email} with role ${role} fetched data - IP Address: ${ipAddress} MAC Address: ${ipAddress}`;
        logInDatabase(logData);
        return true;
    }
    // IF USER IS NOT LOGGED IN
    else{
        const logData = `${new Date().toLocaleString()} - ${email} with role ${role} tried getting data, but user not logged in - IP Address: ${ipAddress} MAC Address: ${ipAddress}`;
        logInDatabase(logData);
        return false;
    }
}

const ab = () => {
    console.log("ab");
}

const addUser = async (name, email, password, role, ipAddress, wardnumber=null) => {
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
                        reject("Internal server error" + err.message);
                    } else {
                        // OTHER PARAMETERS IN CASE OTHER COLUMNS EXISTS
                        if (wardnumber != null) {
                            console.log("adding wardnumber")
                            db1.run("UPDATE users SET wardnumber = ? WHERE email = ?", [wardnumber, email], function(err) {
                                if (err) {
                                    console.error(err.message);
                                    reject("Internal server error" + err.message);
                                }
                            });
                        }
                        // const macAddress = getMacAddress(ipAddress);
                        const macAddress = "::1";
                        const logData = `${new Date().toLocaleString()} - ${name} with role ${role} signed up - IP Address: ${ipAddress} MAC Address: ${macAddress}`;
                        await logInDatabase(logData);
                        res = {code:"uatd", msg:"user added to DB"};
                        resolve(res);
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
        console.log("inside userExistsInDB, email is", email);
        try {
            db1.all(
                // `SELECT * FROM users WHERE name=${name} AND email=${email} AND password=${password} AND role=${role};`,
                `SELECT * FROM users WHERE email="${email}" and password="${password}";`,
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        resolve(false);
                    } 
                    console.log("rows => ", rows);
                    if(rows && rows.length > 0) {
                        resolve(true); // Resolve with true if user exists
                    }else {
                        resolve(false); // Resolve with false if user doesn't exist
                    }
                }
            );
        } catch (e) {
            console.err(e);
        }
    });
};

const isAdmin = (id) => {
    return id == 1234;
}

// Usage example
// login('John Doe', 'john@example.com', 'password123', 'admin');
// login('Alice Smith', 'alice@example.com', 'secret456', 'user');

// const user = userExistsInDB('john@example.com', 'password123');
// if (user) {
//     console.log('Authentication successful:', user);
// } else {
//     console.log('Authentication failed. Invalid email or password.');
// }

module.exports = {login, addUser, isLoggedIn, ab, isAdmin};