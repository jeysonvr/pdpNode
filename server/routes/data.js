const express = require('express');
const app = express();
// const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const iconv = require('iconv-lite');
const axios = require('axios');



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

        })
        .catch(err => {
            console.log("Error", err);
            // errorList.push(sku);
        })

    return { "Sku": 1, "Ficha": 2 };
    // return resultado;
}

app.post('/', async (req, res) => {

    let body = req.body;
    // console.log(body);
    let data = new Array();

    let listadoSKUs = new Array();
    if (body.lista) {
        console.log('Lista:', body.lista);
        listadoSKUs = body.lista.split(',');
        listadoSKUs = listadoSKUs.map(x => x.trim());
    }

    // Process
    if (listadoSKUs.length > 0) {


        let intervalos = setInterval(async () => {
            let resultado = await getPage(listadoSKUs.shift());
            data.push(resultado);
            console.log('ficha: ......................................................', data);
            if (listadoSKUs.length == 0) {
                console.log(data);
                clearInterval(intervalos);
                setTimeout(function () {
                    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                    res.set('Content-Type', 'text/csv');
                    res.csv(data, true, {
                        "Access-Control-Allow-Origin": "*"
                    }, 200);
                    console.log('done');

                    res.send();
                }, 5000);
            }
        }, 1000);

    }

});



module.exports = app;