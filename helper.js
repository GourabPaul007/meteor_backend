const sqlite3 = require("sqlite3").verbose();
const { exec } = require('child_process');

async function getMacAddress(ipAddress) {
    return new Promise((resolve, reject) => {
        exec(`arp -a ${ipAddress}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            const macAddress = stdout.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g);
            if (macAddress) {
                resolve(macAddress[0]);
            } else {
                reject(new Error("MAC address not found for the given IP address."));
            }
        });
    });
}

const logInDatabase = (logData) => {
    const db2 = new sqlite3.Database("database.db");
    db2.run("INSERT INTO logs (logData) VALUES (?)", [logData], function (err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Log Successfully Added");
        }
        db2.close();
    });
}

module.exports = getMacAddress;
module.exports = logInDatabase;