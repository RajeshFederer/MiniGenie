'use strict';

const request = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const actions = require('./lib/action');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{
    return actions[req.body.result.action](req, res);
});


app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});
