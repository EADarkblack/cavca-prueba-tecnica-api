const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const user = require('./src/user');
const department = require('./src/department');
const city = require('./src/city');
const insurer = require('./src/insurer');
const insurance_type = require('./src/insurance_type');
const insurance = require('./src/insurance');
const client = require('./src/client');

//Midddlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(helmet());
app.use(cors());

//Routes
app.use(user);
app.use(department);
app.use(city);
app.use(insurer);
app.use(insurance_type);
app.use(insurance);
app.use(client);

//Listen
app.listen(4000, () => {
    console.log('App listening on port 4000!');
})