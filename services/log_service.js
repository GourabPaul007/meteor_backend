const sqlite3 = require("sqlite3").verbose();



const getLogs = async () => {
    const db = new sqlite3.Database("database.db");
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM logs ORDER BY rowid DESC", (err, rows) => {
            if (err) {
                console.error(err.message);
                reject({ error: "Internal server error, " + err.message });
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};


const logInDatabase = async (logData) => {
    const db = new sqlite3.Database("database.db");
    db.run("INSERT INTO logs (logData) VALUES (?)", [logData], function (err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Log Successfully Added");
        }
        db.close();
    });
}

module.exports = { getLogs, logInDatabase };