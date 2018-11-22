const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
// const csv=require('csvtojson')
const request=require('request')
const d3 = require('d3-dsv')

var mysql = require('mysql');

const config = require('./config')

var con = mysql.createPool({
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
async function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
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

    //const path = "./_data/Datos estacion Calahuancane.csv";//date modificated-dates.cvs
    const path = "./_data/Dates.csv"

    const rawData = await read(path);

    //console.log("rawData",rawData)

    let parsedData = d3.csvParse(rawData);

    //     parsedData = parsedData.map( (item,index) => {

    //         const date = item["Fecha/Hora"]


    //         console.log( date );

    //         // hack for now - assume WHATEVER date comes in is "GMT"
    //         var parsedDate  = new Date(date);
    //         parsedDate = parsedDate.format("isoDateTime");
    //         console.log(parsedDate);

    //         //dateString = dateString.substr(6, 4)+"-"+dateString.substr(3, 2)+"-"+dateString.substr(0, 2);
    //         //console.log(dateString);




    //       // item["Timestamp"] = parsedDate.toISOString();


    //         // rename headers from Chinas stations
    //        // item["temperatura_interna"] = item["Temperatura Interna(°C)"];
    //         //delete item["Temperatura Interna(°C)"];

    //    //     delete item["Fecha/Hora"]

    //     //    return item
    // })


    //const outData = d3.csvFormat(parsedData);
    //const newPath = "./_data/Chinchaya(14_09_2018) - Dates.csv"

    // write(newPath, outData);

    // console.log("parsed data is ", JSON.stringify(parsedData) )

    // check if file is from Davis(True) or China(False) Station.

    let typeOfStation = true
    let countColumn = Object.keys(parsedData[0]).length

    if(countColumn > 40 ){

        typeOfStation = true ;

         }else{

            typeOfStation = false;
        
    }

    con.getConnection((err, connection) => {

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












//function processResult(err,result){
  //  console.log(result)
//}
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