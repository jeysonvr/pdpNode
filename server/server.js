require('./config/config');
const express = require('express');
var csv = require('csv-express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

var cors = require('cors');
app.use(cors());

app.use(require('./routes/data'));

var server = app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto:', process.env.PORT);
});

server.timeout = 1000 * 60 * 10;


// console.log('dir name:', __dirname);


// Habilitar ruta publica
app.use( express.static(path.resolve(__dirname, '../public')) );
// console.log( path.resolve(__dirname + '../public') );