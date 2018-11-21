const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
// const csv=require('csvtojson')
const request=require('request')
const d3 = require('d3-dsv')

var mysql = require('mysql');

var con = mysql.createPool({
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
    const path = "C:/Users/LuciaFalcinelli/Documents/GitHub/weatherstations/_data/MODChinchaya 11_10_2018.csv"

    const rawData = await read(path);

   // console.log("rawData",rawData)
    //return; 

    let parsedData = d3.tsvParse(rawData);

    parsedData = parsedData.map( (item,index) => {

        const date = item["Fecha/Hora"]

        console.log( date );

    //     // hack for now - assume WHATEVER date comes in is "GMT"
        const parsedDate = new Date(date+" GMT")
        parsedDate.getFullYear();

        console.log(parsedDate);


         item["Timestamp"] = parsedDate.toISOString();


    //     // rename headers from Chinas stations
    //    // item["temperatura_interna"] = item["Temperatura Interna(°C)"];
    //     //delete item["Temperatura Interna(°C)"];

         delete item["Fecha/Hora"]

         return item
     })


    const outData = d3.csvFormat(parsedData);
    const newPath = "./_data/Chinchaya(11_10_2018) - Dates.csv"

    write(newPath, outData);

   // console.log("parsed data is ", JSON.stringify(parsedData) )

    con.getConnection((err, connection) => {
        //test with just intervalo 
        parsedData = parsedData.map( (item, index) => {
            var newItem = {}
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

// data from MODDatos estacion Calahuancane
      //    newItem['yyyy'] = item['YYYY'];
      //    newItem['mm'] = item['MM'];
      //    newItem['dd'] = item['DD'];
     //     newItem['time'] = item['Time'];
      //    newItem['hi_temp'] = item['Hi_Temp'];
       //   newItem['low_temp'] = item['Low_Temp'];
        //  newItem['wind_cod'] =  item['Wind_Cod'];
         // newItem['wind_run'] = item['Wind_Run'];
         // newItem['hi_speed'] = item['Hi_Speed'];
         // newItem['hi_dir'] = item['Hi_Dir'];
         // newItem['wind_cod_dom'] = item['Wind_Cod_Dom'];
         // newItem['wind_chill'] = item['Wind_Chill'];
        //  newItem['index_heat'] = item['Heat_Index'];
        //    newItem['index_thw'] = item['THW_Index'];
        //    newItem['index_thsw'] = item['THSW_Index'];
        //    newItem['presion_relativa'] = item['Bar'];
        //    newItem['rain'] = item['Rain'];
        //    newItem['lluvia_hora'] = item['Rain_Rate'];
        //    newItem['solar_rad'] = item['Solar_Rad.'];
        //    newItem['solar_energy'] = item['Solar_Energy'];
        //    newItem['radsolar_max'] = item['Hi_Solar_Rad.'];
        //    newItem['uv_index'] = item['UV_Index'];
        //    newItem['uv_dose'] = item['UV_Dose'];
        //    newItem['uv_max'] = item['Hi_UV'];
        //    newItem['heat_days_d'] = item['Heat_D-D'];
        //    newItem['cool_days_d'] = item['Cool_D-D'];
        //    newItem['in_dew'] = item['In_Dew'];
        //    newItem['in_heat'] = item['In_Heat'];
        //    newItem['in_emc'] = item['In_EMC'];
        //    newItem['in_air_density'] = item['In_Air_Density'];
        //    newItem['evapotran'] = item['ET'];
        //    newItem['soil_1_moist'] = item['Soil_1_Moist.'];
        //    newItem['soil_2_moist'] = item['Soil_2_Moist.']; 
        //    newItem['leaf_wet1'] = item['Leaf_Wet_1'];
        //    newItem['wind_samp']=item['Wind_Samp'];
        //    newItem['wind_tx'] = item['Wind_Tx'];
        //    newItem['iss_recept'] = item['ISS_Recept'];
        //    newItem['intervalo'] = item['Arc._Int.'];
        //    newItem['temperatura_interna'] = item['In_Temp'];
        //    newItem['humedad_interna'] = item['In_Hum'];
        //    newItem['direccion_del_viento'] = item['Wind_Dir'];
        //    newItem['velocidad_viento'] =item['Wind_Speed'];
        //    newItem['punto_rocio'] = item['Dew_Pt.'];
        //    newItem['humedad_externa'] = item['Out_Hum'];
        //    newItem['temperatura_externa'] = item['Temp_Out'];
       







            if (err) throw err;
            //Select all customers and return the result object:
            connection.query("INSERT INTO `chinas-davis` SET ?;", newItem, function (err, result, fields){
                if (err) throw err;
                console.log(result);
            })


        })

    })
 
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