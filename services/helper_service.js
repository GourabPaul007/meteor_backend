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

const getIntersect = (s1,s2) => {
    // const a1 = s1.trim().split(",")
    // const a2 = s2.trim().split(",")
    // const setA = new Set(a1);
    // const intersectArrayWithDuplicates =  a2.filter(value => setA.has(value));
    // const intersectArray = [...new Set(intersectArrayWithDuplicates)];
    // return intersectArray.join(",");

    const a1 = s1.trim().split(",")
    const a2 = s2.trim().split(",")
    const set1 = new Set(a1);
    const set2 = new Set(a2);
    const result = [];
    set1.forEach(item => {
        if (set2.has(item)) {
            result.push(item);
        }
    });
    console.log(result.join(","));
    return result.join(",");
}

module.exports = {getMacAddress, getIntersect};