require('./config/config');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

app.use(require('./routes/data'));

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto:', process.env.PORT);
});