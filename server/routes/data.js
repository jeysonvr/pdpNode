const express = require('express');
const app = express();
// const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const iconv = require('iconv-lite');
const axios = require('axios');
// var csv = require('csv-express');
var csv = require('to-csv');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.email,
        pass: process.env.email_pass
    }
});

let data = [];

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
            data.push({ Sku: sku, Ficha: 'lista' });

        })
        .catch(err => {
            console.log("Error", err);
        })
}

app.post('/', (req, res) => {
    data = [];
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

                    var mailOptions = {
                        from: 'Foo Bar ✔ <foobar@gmail.com>',
                        to: 'jeysonvegaromero@gmail.com',
                        subject: "Hello from node",
                        text: 'Hello there ✔',
                        html: "<p>Hello  </p>",
                        attachments: [
                            {
                                filename: 'text1.csv',
                                content: csv(data)
                            }
                        ]
                        // bcc: "fred@gmail.com"
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent: ' + info.response);
                            res.send(200);
                        }
                    });
                
                
                    res.status(200).json({
                        ok: true,
                        message: 'Enviado'
                    });

                    // res.csv(data, true, {
                    //     "Access-Control-Allow-Origin": "*"
                    // }, 200);

                    // res.send();
                    console.log('done');
                }, 20000);
            }
        }, 1000);

    }


    

});



module.exports = app;
