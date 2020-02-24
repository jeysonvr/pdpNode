const express = require('express');
const app = express();
const fs = require('fs');

app.post('/', (req, res) => {

    let body = req.body;
    // console.log(body);

    let listadoSKUs = new Array();
    if( body.lista ) {
        console.log( 'Lista:', body.lista );
        listadoSKUs = body.lista.split(',');
        listadoSKUs = listadoSKUs.map( x => x.trim() );
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


    res.json({
        ok: true,
        mensaje: "Todo está bien post 1",
        lista: listadoSKUs
    });

});

module.exports = app;