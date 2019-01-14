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
async function main() {

    // const path = "./_data/Datos estacion Calahuancane.csv";
    const path = "C:/Users/LuciaFalcinelli/Documents/GitHub/weatherstations/_data/Chinchaya 11_10_2018.csv"

    const rawData = await read(path);

// console.log("rawData",rawData)

    
    let parsedData = d3.tsvParse(rawData);
    let numberOne = [];
    let numberTwo = [];
    let dateArray = [];

     parsedData = parsedData.map( (item,index) => {

         const date = item["Fecha/Hora"];

         //check format of date
        // let dateArray = [];
         // check if '/' exist
         if(date.indexOf('/') > -1) {
            dateArray = date.split('/');
         }
         else if(date.indexOf('-') > -1){
            dateArray = date.split('-');
         }

      //   console.log("array ",dateArray);
      //remove whitespace from both sides of a string

        dateArray[0] = dateArray[0].trim()
        dateArray[1] = dateArray[1].trim()

         numberOne.push(Number(dateArray[0]))
         numberTwo.push(Number(dateArray[1]))

         //console.log("number 1 ",numberOne)
         //console.log("number 2 ",numberTwo)


          numOneStd = math.std(numberOne);
          numTwoStd = math.std(numberTwo);




          //console.log("number 1 ",numOneStd)
         // console.log("number 2 ",numTwoStd)



      



    //     // hack for now - assume WHATEVER date comes in is "GMT"
          const parsedDate = new Date(dateArray+" GMT")



         // item["Timestamp"] = parsedDate.toISOString();


         //rename headers from Chinas stations
   //      item["temperatura_interna"] = item["Temperatura Interna(°C)"];
     //    delete item["Temperatura Interna(°C)"];

  //     delete item["Fecha/Hora"]

          return item
       })

       // console.log("count", numberOne);
         // compare sd.


          if (numOneStd > numTwoStd) {

            dateArray.splice(0, 0, dateArray[1], dateArray[0]);
            dateArray.splice(2,1);
            dateArray.splice(2,1);
            
          
                }else if(numOneStd < numTwoStd){
                    return dateArray;

            }


         for(var i = 0; i < dateArray.length; i++){ 
            
         console.log("dateArray ", dateArray[i])
         
        }
         console.log("math.std ONE", math.std(numberOne))
         console.log("math.std TWO", math.std(numberTwo))




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