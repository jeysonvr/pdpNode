const express = require('express');
const app = express();
const fs = require('fs');

app.post('/', (req, res) => {

    let body = req.body;
    // console.log(body);

    let listadoSKUs = new Array();
    if (body.lista) {
        console.log('Lista:', body.lista);
        listadoSKUs = body.lista.split(',');
        listadoSKUs = listadoSKUs.map(x => x.trim());
    }

    // Process
    // function saveDoc() {
    fs.appendFile('prueba/prueba_1.csv', '\ufeff' + 'abcdario', { encoding: 'utf16le' }, function (err) {
        if (err) {
            console.log('error: ', err);
        } else {
            console.log('bien ok!!');
        }
    });
    // }


    res.status(200).json({
        ok: true,
        mensaje: "Todo está bien post 2",
        lista: listadoSKUs
    }).download('/prueba.csv');

    // res.status(200).download('/prueba.csv');

    // res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    // res.set('Content-Type', 'text/csv');
    // res.status(200).send(csv);
    // res.csv([
    //     { "a": 1, "b": 2, "c": 3 },
    //     { "a": 4, "b": 5, "c": 6 }
    // ], true, {
    //     "Access-Control-Allow-Origin": "*"
    // }, 200);

});

module.exports = app;