const fs = require('fs');


// reads data from file
// Requires:
//  - path: path to file (string)
exports.read = async function (path, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, encoding, (err, data) => {


            if (err){
                console.log("read error ",err);
                throw err;
            }
            resolve(data);
        });
    });
}