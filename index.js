const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
// const csv=require('csvtojson')
const request=require('request')
const d3 = require('d3-dsv')

var mysql = require('mysql');

const math = require('mathjs')

const config = require('./config')

var con = mysql.createConnection({
    host: "localhost",
    user: config.config.username,
    password: config.config.password,
    database: config.config.database
});

var con_dates = mysql.createPool({
    host: "localhost",
    user: config.config.username,
    password: config.config.password,
    database: config.config.database
});


// *****************************************************
// Define Read / Write Functions
// *****************************************************





// reads data from file
// Requires:
//  - path: path to file (string)


async function read(path,encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, encoding, (err, data) => { // utf16le or utf8
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
    const path = "C:/Users/LuciaFalcinelli/Documents/GitHub/weatherstations/_data/Chinchaya.csv"

    const rawData = await read(path,"utf8");//utf8 or utf18le codeutf




    //check comma or space

    let title = Object.keys(rawData[8])
    console.log(title)
    let typeofTable = true;

    if(rawData[0].indexOf(',') > -1) {
            typeOfTable = false;

        }
        else if(rawData[0].indexOf('|') > -1){
           typeOfTable = true;
        }
console.log(typeofTable)
   
    let parsedData = d3.csvParse(rawData);
        if(typeofTable){ 
        parsedData = d3.tsvParse(rawData); // csv or tsc
          }else if(!typeofTable){
            parsedData = d3.csvParse(rawData);

   }   



    let numberOne = [];
    let numberTwo = [];
    let dateArray = [];
    let dates = [];
    let isoDates = [];

    // check if file is from Davis(True) or China(False) Station

    let typeOfStation = true
    let countColumn = Object.keys(parsedData[0]).length


    if(countColumn > 40 ){

        typeOfStation = true ;

         }else{

            typeOfStation = false;
        
    }

    //creates column Fecha/Hora in file davis

    if(typeOfStation){
        parsedData = parsedData.map( (item, index) => {
           
        const date = item["Date"];
        const hour = item["Time"];
 
        item["Fecha/Hora"] = date + " " + hour;


        return item
        
        })
    }





   // console.log(parsedData)

    parsedData = parsedData.map( (item,index) => {


        Object.keys(item).forEach((key,i) => {
            

            //remove excess properties
            if(key.trim() != key) {
                item[key.trim()] = item[key];
                delete item[key];


            }
        })
        
        const date = item["Fecha/Hora"];
   
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
         
            length = dates[index].length
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

  //  const outData = d3.csvFormat(parsedData);

   // const newPath = "./_data/Dates.csv"

    //await write(newPath, outData);

    // console.log("parsed data is ", JSON.stringify(parsedData) )


    // con.connect(function(err){


    //     if (err) throw err;
    //     //Select all customers and return the result object:
    //     con.query("INSERT INTO `chinas-davis` SET ?", parsedData, function (err, result, fields){
    //     if (err) throw err;
    //     console.log(result);
    //     });
    // });



// strat second part

  //  const path_dates = d3.csvFormat(parsedData);

  //  const rawData_dates = await read(path_dates);

 //   let parsedData_dates = d3.csvParse(rawData_dates);

    con_dates.getConnection((err, connection) => {

        if (err) throw err;

        //test with just intervalo
        parsedData = parsedData.map( (item, index) => {
            var newItem = {}


            if(!typeOfStation){
                newItem['intervalo'] = item['Intervalo'];
                newItem['fecha_hora'] = item['Fecha/Hora'];
                newItem['temperatura_interna'] = item['Temperatura Interna(°C)'];
                newItem['humedad_interna'] = item['Humedad Interna(%)'];
                newItem['temperatura_externa'] = item['Temperatura Externa(°C)'];
                newItem['humedad_externa'] = item['Humedad Externa(%)'];
                newItem['presion_relativa'] = item['Presión Relativa(hpa)'];
                newItem['presion_absoluta'] = item['Presión Absoluta(hpa)'];
                newItem['velocidad_viento'] = item['Velocidad del viento(m/s)'];
                newItem['sensacion_termica'] = item['Sensación Térmica(°C)'];
                newItem['rafaga'] = item['Ráfaga(m/s)'];
                newItem['direccion_del_viento'] = item['Dirección del viento'];
                newItem['punto_rocio'] = item['Punto de Rocío(°C)'];
                newItem['lluvia_hora'] = item['Lluvia hora(mm)'];
                newItem['lluvia_24_horas'] = item['Lluvia 24 horas(mm)'];
                newItem['lluvia_semana'] = item['Lluvia semana(mm)'];
                newItem['lluvia_mes'] = item['Lluvia mes(mm)'];
                newItem['lluvia_total'] = item['Lluvia Total(mm)'];

                    }else if(typeOfStation){
            
            // data from MODDatos estacion Calahuancane
            
                    newItem['fecha_hora'] = item['Fecha/Hora'];
                    newItem['hi_temp'] = item['Hi_Temp'];
                    newItem['low_temp'] = item['Low_Temp'];
                    newItem['wind_cod'] =  item['Wind_Cod'];
                    newItem['wind_run'] = item['Wind_Run'];
                    newItem['hi_speed'] = item['Hi_Speed'];
                    newItem['hi_dir'] = item['Hi_Dir'];
                    newItem['wind_cod_dom'] = item['Wind_Cod_Dom'];
                    newItem['wind_chill'] = item['Wind_Chill'];
                    newItem['index_heat'] = item['Heat_Index'];
                    newItem['index_thw'] = item['THW_Index'];
                    newItem['index_thsw'] = item['THSW_Index'];
                    newItem['presion_relativa'] = item['Bar'];
                    newItem['rain'] = item['Rain'];
                    newItem['lluvia_hora'] = item['Rain_Rate'];
                    newItem['solar_rad'] = item['Solar_Rad.'];
                    newItem['solar_energy'] = item['Solar_Energy'];
                    newItem['radsolar_max'] = item['Hi_Solar_Rad.'];
                    newItem['uv_index'] = item['UV_Index'];
                    newItem['uv_dose'] = item['UV_Dose'];
                    newItem['uv_max'] = item['Hi_UV'];
                    newItem['heat_days_d'] = item['Heat_D-D'];
                    newItem['cool_days_d'] = item['Cool_D-D'];
                    newItem['in_dew'] = item['In_Dew'];
                    newItem['in_heat'] = item['In_Heat'];
                    newItem['in_emc'] = item['In_EMC'];
                    newItem['in_air_density'] = item['In_Air_Density'];
                    newItem['evapotran'] = item['ET'];
                    newItem['soil_1_moist'] = item['Soil_1_Moist.'];
                    newItem['soil_2_moist'] = item['Soil_2_Moist.'];
                    newItem['leaf_wet1'] = item['Leaf_Wet_1'];
                    newItem['wind_samp']=item['Wind_Samp'];
                    newItem['wind_tx'] = item['Wind_Tx'];
                    newItem['iss_recept'] = item['ISS_Recept'];
                    newItem['intervalo'] = item['Arc._Int.'];
                    newItem['temperatura_interna'] = item['In_Temp'];
                    newItem['humedad_interna'] = item['In_Hum'];
                    newItem['direccion_del_viento'] = item['Wind_Dir'];
                    newItem['velocidad_viento'] =item['Wind_Speed'];
                    newItem['punto_rocio'] = item['Dew_Pt.'];
                    newItem['humedad_externa'] = item['Out_Hum'];
                    newItem['temperatura_externa'] = item['Temp_Out'];
                }


            if (err) throw err;

            insertToTable(connection,newItem,processResult);

            // return the newItem (adds to array returned from map)
            //return newItem;
        })
        // parsedData now has the correct columns for import;

        
        //insertToTable(connection,parsedData);


    })

}



main();

async function insertToTable(connection, newItem,callback){
    //Select all customers and return the result object:
    connection.query("INSERT INTO `chinas-davis` SET ?;", newItem, function (err, result, fields){
        if (err) {
            console.log("err",err);
        }
        else {
            callback(null,result);
        }
    });
}

function processResult(err,result){
    console.log(result)
}
//*** Stuff below here is only for when we want to run this on a server ***//
//
//
// const app = express()

// app.use(express.static('public'))
// app.use(bodyParser.json())




//async function insertToTable(connection, parsedData){

    //for import, values must be in a nested array (in the correct order);
   // console.log(parsedData[0]);



   //const columnHeaders = Object.keys(parsedData[0]);

    //for the INSERT statement, column headers need to be a string in the format (`col1`, `col2`, `col3` etc).
   // let columnString = columnHeaders.join("`,`")
    //add the brackets and ` to the start and end of the string
    //columnString = "(`"+columnString+"`)";

    // prepare values as nested array;


   // const insertValues = parsedData.map( (item,index) => {
    //    return Object.values(item);
  //  })

    // console.log("insertingValues",insertValues);

    

    //divide a half file and run 
   //let valueTot = Number(insertValues.length)
    //console.log("valuetot ",valueTot / 10000)
    //let limit = 10000
  //  let partialInsert = insertValues.slice(144001,144563)

    
   // for(i = 0; i <= valueTot - 1 ; i = limit+1){

    //    partialInsert = insertValues.slice(i, limit * 2);

 //    limit = limit*2
        
//}

    // prepare queryString (including column headers as string).
//    const queryString = "INSERT INTO `chinas-davis` " + columnString + " VALUES ?"; //chinas-davis


    //Select all customers and return the result object:
 //   connection.query(queryString, [insertValues], function (err, result, fields){ //partialInsert
//        if (err) {
 //           console.log("err",err);
  //          write("./_data/error.txt",err);
 //           connection.release();
  //      }
  //      else {
  //          console.log("result:", result);
  //          console.log("done");
  //          connection.release();
    //    }
   // });
//}


//*** Stuff below here is only for when we want to run this on a server ***//
//
//
// const app = express()

// app.use(express.static('public'))
// app.use(bodyParser.json())






// app.listen(7555, () => {
//     console.log("Server running on http://localhost:7555");
// })