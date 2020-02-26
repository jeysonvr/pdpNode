const express = require('express');
const app = express();
// const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const iconv = require('iconv-lite');
const axios = require('axios');
var csv = require('csv-express');

let data = new Array();

const getPage = async (sku) => {

    let url = `https://www.homecenter.com.co/homecenter-co/product/${sku}/`;

    const instance = axios.create({
        baseURL: url
    });

    instance.get()
        .then(async (resp) => {
            let $ = cheerio.load(resp.data, { decodeEntities: false });

            let lista = '';
            if ($('.prod-ficha.tab-list').length != 0) {
                lista += '"<ul>';
                ficha = $('.prod-ficha.tab-list').find('.box-atrib').each(function () {
                    lista += '<li>';
                    $(this).find('td').each(function (j) {
                        if (j == 0) {
                            lista += $(this).text() + ' : ';
                        } else {
                            lista += $(this).text().replace(/\n/gi, ' ');
                        }
                    });
                    lista += '</li>';
                });
                lista += '</ul>"\n';
            } else {
                lista += '"Producto no publicado en página"\n';
            }
            console.log('Proceso: ', sku, lista);
            data.push( { "Sku": sku, "Ficha": lista } );

        })
        .catch(err => {
            console.log("Error", err);
            // errorList.push(sku);
        })

    // return resultado;
}

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
    if (listadoSKUs.length > 0) {


        let intervalos = setInterval(async () => {
            getPage(listadoSKUs.shift());
            if (listadoSKUs.length == 0) {
                console.log(data);
                clearInterval(intervalos);
                setTimeout(function () {
                    console.log('ficha: ......................................................', data);

                    res.csv(data, true, {
                        "Access-Control-Allow-Origin": "*"
                    }, 20000);
                    
                    res.send();
                    console.log('done');
                }, 5000);
            }
        }, 1000);

    }

    // res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    // res.set('Content-Type', 'text/csv');
    // res.csv([
    //     { "a": 1, "b": 2, "c": 3 },
    //     { "a": 4, "b": 5, "c": 600 }
    // ], true, {
    //     "Access-Control-Allow-Origin": "*"
    // }, 200);
    // res.send();
    
});



module.exports = app;
