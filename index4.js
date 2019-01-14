const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
// const csv=require('csvtojson')
const request=require('request')
const d3 = require('d3-dsv')

var mysql = require('mysql');

const math = require('mathjs')

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Logoslogos88",
    database: "umsa"
});


// *****************************************************
// Define Read / Write Functions
// *****************************************************


// reads data from file
// Requires:
//  - path: path to file (string)
async function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => { // utf16le
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
async function main() {

    // const path = "./_data/Datos estacion Calahuancane.csv";
    const path = "C:/Users/LuciaFalcinelli/Documents/GitHub/weatherstations/_data/MODDatos estacion Calahuancane.csv"

    const rawData = await read(path);

//
//console.log("rawData",rawData)

    //check comma or space
    let parsedData = d3.tsvParse(rawData);

    let numberOne = [];
    let numberTwo = [];
    let dateArray = [];
    let dates = [];
    let isoDates = [];


   // console.log(parsedData)

    parsedData = parsedData.map( (item,index) => {

        const date = item["Fecha/Hora"];
        console.log(date)

        // check format of date
        // let dateArray = [];
        // check if '/' or '-' exist and create an array with the following elements: dd, mm, yyyy hh:mm:ss
        if(date.indexOf('/') > -1) {
            dateArray = date.split('/');
        }
        else if(date.indexOf('-') > -1){
            dateArray = date.split('-');
        }
        


        // replace a.m. and p.m. with AM and PM
           
        dateArray[2] = dateArray[2].replace("a.m.", "AM")
        dateArray[2] = dateArray[2].replace("p.m.", "PM")

        // remove whitespace from both sides of a string

        dates.push(dateArray[0].trim())
        dates.push(dateArray[1].trim())
        dates.push(dateArray[2].trim())

        // create two arrays with days and months of dateArray   

        numberOne.push(Number(dateArray[0]))
        numberTwo.push(Number(dateArray[1]))
        //console.log("number 1 ",numberOne)
        //console.log("number 2 ",numberTwo)

        return item
    })

    //calculate standard deviation between months and days 

    var numOneStd = math.std(numberOne);
    var numTwoStd = math.std(numberTwo);
  
    //console.log(numTwoStd)
    //console.log(numOneStd)

    // returns a string with the following order: mm, dd, yyyy hh:mm:ss 
    for (var i = 0; i <= dates.length - 1; i += 3) {

        if (numOneStd > numTwoStd ) {
            date = dates[i]
            dates[i] = dates[i+1]
            dates[i+1] = date
            dates[i+2] = dates[i+2]            

        }else if(numOneStd < numTwoStd){
            dates[i] = dates[i]
            dates[i+1] = dates[i+1]
            dates[i+2] = dates[i+2]


        }

 
    } 



      // check month and hour length and adds 0 where it is missing 

        parsedData = parsedData.map((item, index) => {
            str = ""
            str = (dates[index])

            length = str.length
            //console.log("length", length)
           
            if(length == 1){
                dates[index] = "0" + dates[index]
            } else if (length == 15){
                dates[index] = dates[index].substring(0, 5) + "0" + dates[index].substring(5, 15)


            }


            return item

        })
        

        
        // returns an arrays with dates in ISO format (yyyy-mm-dd hh:mm:ss)  
        for (var i = 0; i <= dates.length - 1; i += 3) {

            let dateString =dates[i] + "-" + dates[i+1] + "-" + dates[i+2] + " GMT";
        
            const parsedDate = new Date(dateString)
            dateString = parsedDate.toISOString();
            dateString = dateString.replace("T"," ")
            dateString = dateString.replace("Z", "")
            isoDates.push(dateString)


    }

    
        // substitute ISO format dates in the Fecha/Hora column  
        parsedData = parsedData.map((item, index) =>{

            item["Fecha/Hora"] = isoDates[index]
    
            return item
    
    })




    // create new file with new dates

    const outData = d3.csvFormat(parsedData);

    const newPath = "./_data/Chinchaya(14_09_2018) - Dates.csv"

    write(newPath, outData);

    // console.log("parsed data is ", JSON.stringify(parsedData) )


    // con.connect(function(err){


    //     if (err) throw err;
    //     //Select all customers and return the result object:
    //     con.query("INSERT INTO `chinas-davis` SET ?", parsedData, function (err, result, fields){
    //     if (err) throw err;
    //     console.log(result);
    //     });
    // });

}


main();


//*** Stuff below here is only for when we want to run this on a server ***//
//
//
// const app = express()

// app.use(express.static('public'))
// app.use(bodyParser.json())






// app.listen(7555, () => {
//     console.log("Server running on http://localhost:7555");
// })