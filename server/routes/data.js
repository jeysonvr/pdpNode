const express = require('express');
const app = express();
// const fs = require('fs');

let data = new Array();


const getPage = (sku) => {
    request({ uri: `https://www.homecenter.com.co/homecenter-co/product/${sku}`, encoding: null }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            body = iconv.decode(body, 'ISO-8859-1');
            let $ = cheerio.load(body, { decodeEntities: false });
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

            data.push({ "Sku": sku, "Ficha": lista });

        }
    });
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

        let intervalos = setInterval(() => {
            getPage(listadoSKUs.shift());

            if (!listadoSKUs) {
                clearInterval(intervalos);
                setTimeout(function () {
                    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                    res.set('Content-Type', 'text/csv');
                    res.csv(data, true, {
                        "Access-Control-Allow-Origin": "*"
                    }, 200);

                    res.send();
                }, 20000);
            }
        }, 1000);

    }

});



module.exports = app;