const getRows = async (email, columns, name) => {
    if (!isLoggedIn(email, req.ip)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if(role == "doctor" || role == "clerk" || role == "nurse"){
        db.all(
            `SELECT ${columns} FROM patients WHERE LastExaminer="${doctor_name}"`,
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ error: "Internal server error" });
                } else {
                    res.json({ cols: DOCTOR_SET.split(","), data: rows });
                }
            }
        );
    }
        
}

module.exports = { getRows };