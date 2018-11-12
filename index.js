const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const d3 = require('d3-dsv');


// *****************************************************
// Define Read / Write Functions
// *****************************************************

// reads data from file
// Requires:
//  - path: path to file (string)
async function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf16le", (err, data) => {
            if (err){
                throw err;
            }
            resolve(data);
        });
    });
}

// Function for writing files
// Requires:
//  - path: path to file to write (string)
//  - content: the contents of the file (string)
async function write(path,content) {
    return new Promise((resolve,reject) => {
        fs.writeFile(path,content, (err) => {
            if (err) {
                throw err;
            }
            console.log("file saved to path ", path);
        })
    })
}


// main function to run.
// This is wrapped in an "async" function to allow the read/write functions to work with "await" command.
async function main(req,res) {

    // const path = "./_data/Datos estacion Calahuancane.csv";
    const path = "./_data/Chinchaya (14_09_2018).csv"

    const rawData = await read(path);

    let parsedData = d3.tsvParse(rawData);

    parsedData = parsedData.map( (item,index) => {

        const date = item["Fecha/Hora"];

        // hack for now - assume WHATEVER date comes in is "GMT"
        const parsedDate = new Date(date+" GMT")


        item["Timestamp"] = parsedDate.toISOString();

        return item
    })

    const outData = d3.csvFormat(parsedData);
    const newPath = "./uploads/Chinchaya (14_09_2018) - Changed Dates.csv"

    write(newPath, outData);
    res.sendStatus(200);

}

module.exports.main = main;
module.exports.read = read;
module.exports.write = write;
