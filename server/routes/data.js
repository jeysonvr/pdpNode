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
            let page = 'ATG';
            //ATG
            if ($('.prod-ficha.tab-list').length != 0) {
                lista += '<ul>';
                $('.prod-ficha.tab-list').find('.box-atrib').each(function () {
                    lista += `<li>${ $(this).find('td').eq(0).text().replace(',','\,') } : ${ $(this).find('td').eq(1).text().replace(/\n/gi, ' ').replace(/\,/g,' ')}</li>`;
                });
                lista += '</ul>';
            } else if ($('div[id="Ficha técnica"] .content .content .row').length != 0) {
                page = 'Catalyst';
                lista += '<ul>';
                $('div[id="Ficha técnica"] .content .content .row').each(function () {
                    lista += `<li>${$(this).find('div.title').text()} : ${$(this).find('div.value').text().replace(/\n/gi, ' ').replace(/\,/g,' ')}</li>`;
                });
                lista += '</ul>';
            } else {
                lista += '"Producto no publicado en página"';
            }

            console.log(`Proceso - ${page}: `, sku, lista);
            data.push({ Sku: sku, Ficha: lista });

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

        // Response: ok
        let msj = `Este proceso toma aprox ${Math.ceil(listadoSKUs.length / 60)} minutos`;
        res.status(200).json({
            ok: true,
            message: 'En proceso: Le será enviado un correo al finalizar',
            tiempo: msj
        });

        let intervalos = setInterval(async () => {
            getPage(listadoSKUs.shift());
            if (listadoSKUs.length == 0) {
                console.log(data);
                clearInterval(intervalos);
                setTimeout(function () {

                    // Send mail
                    var mailOptions = {
                        from: 'Homecenter VAD ✔ <homecenter.vad.dev@gmail.com>',
                        to: 'jeysonvegaromero@gmail.com',
                        subject: "Excel - Fichas técnicas",
                        text: 'Excel - Fichas técnicas',
                        html: "<p>Hola, se realizó una solicitud para obtener el listado de fichas técnicas de productos <b>Homecenter-co</b>.</p><p>Adjunto encontrará un excel con la información solicitada.</p>",
                        attachments: [
                            {
                                filename: 'pdp.csv',
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

                }, 15000);
            }
        }, 1000);

    } else {
        res.status(400).json({
            ok: false,
            message: 'Error: Debe enviar un listado de skus',
            tiempo: 0
        });
    }




});



module.exports = app;
