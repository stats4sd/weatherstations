const path = require('path');
const os = require('os');
const fs = require('fs');
const d3 = require('d3-dsv');

const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csvtojson')
const request = require('request');
const mysql = require('mysql2/promise');
const math = require('mathjs');
const iconv = require('iconv-js');
const config = require('./config');
const chardet = require('chardet');

const helpers = require('./helpers.js')
const db = require('./db.js');

exports.handle = async function (path) {
    console.log("HANDLING FILE", path)
    // start file processing here...
    let encoding = chardet.detectFileSync(path);
    //console.log("encoding ",encoding)
    let rawData  = [];

    //checks if file is utf16l3 encoding or utf8 encoding
    if(encoding=="UTF-8" || encoding == "ISO-8859-1"){
        rawData = await helpers.read(path, "utf8");
    }else if(encoding == "UTF-16LE"){
        rawData = await helpers.read(path, "utf16le");
    };

    // checks if file is csv format or tsv format
    for(i = 0; i <= 10; i++){
        if(rawData[i] == ","){
            parsedData = d3.csvParse(rawData);
            csvFormat = true;
        }else if(rawData[i] == '\t'){
            parsedData = d3.tsvParse(rawData);
            csvFormat = false;
        }

    }


    let numberOne = [];
    let numberTwo = [];
    let dateArray = [];
    let dates = [];
    let isoDates = [];

    // checks if file is from Davis(True) or China(False) Station

    let typeOfStation = true
    let countColumn = Object.keys(parsedData[0]).length

    if(countColumn > 40 ){
        typeOfStation = true ;
    }else{
        typeOfStation = false;
    }

    //creates Fecha/Hora column in file davis

    if(typeOfStation){
        parsedData = parsedData.map( (item, index) => {
        const date = item["Date"];
        const hour = item["Time"];
        item["Fecha/Hora"] = date + " " + hour;
        return item
        })
    }

    parsedData = parsedData.map( (item,index) => {

        Object.keys(item).forEach((key,i) => {
            //remove excess properties
            if(key.trim() != key) {
                item[key.trim()] = item[key];
                delete item[key];
            }
        })

        const date = item["Fecha/Hora"];

        //checks if '/' or '-' exist and create an array with the following elements: dd, mm, yyyy hh:mm:ss
        if(date.indexOf('/') > -1) {
            dateArray = date.split('/');
        }
        else if(date.indexOf('-') > -1){
            dateArray = date.split('-');
        }

        //replaces a.m. and p.m. with AM and PM

        dateArray[2] = dateArray[2].replace("a.m.", "AM")
        dateArray[2] = dateArray[2].replace("p.m.", "PM")

        //removes whitespace from both sides of a string

        dates.push(dateArray[0].trim())
        dates.push(dateArray[1].trim())
        dates.push(dateArray[2].trim())

        //creates two arrays with days and months of dateArray

        numberOne.push(Number(dateArray[0]))
        numberTwo.push(Number(dateArray[1]))

        return item
    });

    console.log("checking dates");

    //calculates standard deviation between months and days

    var numOneStd = math.std(numberOne);
    var numTwoStd = math.std(numberTwo);

    //returns a string with the following structure: mm, dd, yyyy hh:mm:ss, etc.

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

      //checks month and hour length and adds 0 where it is missing

        parsedData = parsedData.map((item, index) => {

            length = dates[index].length;

            if(length == 1){
                dates[index] = "0" + dates[index];
            }else if (length == 15){
                dates[index] = dates[index].substring(0, 5) + "0" + dates[index].substring(5, 15);

            }

            return item

        })



        // returns an arrays with dates in ISO format (yyyy-mm-dd hh:mm:ss)
        for (var i = 0; i <= dates.length - 1; i += 3) {

            let dateString = dates[i] + "-" + dates[i+1] + "-" + dates[i+2] + " GMT";

            const parsedDate = new Date(dateString);
            dateString = parsedDate.toISOString();
            dateString = dateString.replace("T"," ");
            dateString = dateString.replace("Z", "");
            isoDates.push(dateString);

    }


        // substitutes ISO format dates in the Fecha/Hora column
        parsedData = parsedData.map((item, index) =>{

            item["Fecha/Hora"] = isoDates[index]

            return item

    })

    parsedData = parsedData.map( (item, index) => {
        var newItem = {}

        // passes data into the corresponding database columns for China station

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

                }
        else if(typeOfStation){

            // passes data into the corresponding database columns for Davis station

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


        // insertToTable(dbPool,newItem,processResult);

        // return the newItem (adds to array returned from map)
        return newItem;
    });


    var dbPool;

    if(!dbPool){
        try {
             v = db.con_dates;
        }
        catch(err) {
            console.log("error in dbPool making");
            //throw err;
        }
    }


    await parallelInserts(parsedData, dbPool);

    return "done";
    // parsedData now has the correct columns for import;
    //insertToTable(connection,parsedData);
}

async function parallelInserts(parsedData, pool) {

    var i, tempArray, chunk = 1000;

    for(i=0; i<parsedData.length; i+chunk){

        tempArray = parsedData.slice(i,i+chunk);
        insertToTable(parsedData,pool);
    }

}


async function insertToTable(parsedData,pool){

    console.log("setting up db connection");

    var connection;
    console.log("inserting into table");
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        var count = 0;
        for(const row of parsedData){
            count++
            console.log("count = ", count);
            await connection.query('INSERT INTO `chinas-davis` SET ?;', row)
        }

        console.log("committing");
        await connection.commit();
    }

    catch(err) {
        console.log("rolling back");
        await connection.rollback();
        throw err;
    }

    finally {
        console.log("finally, releasing");
        await connection.release();
    }

}
