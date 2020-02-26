require('./config/config');
const express = require('express');
var csv = require('csv-express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

var cors = require('cors');
app.use(cors());

app.use(require('./routes/data'));

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto:', process.env.PORT);
});


console.log('dir name:', __dirname);