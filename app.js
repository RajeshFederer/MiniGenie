'use strict';

const request = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const DialogflowApp = require('actions-on-google').DialogflowApp;
const facebookActions = require('./lib/facebookAction');
const googleActionMap = require('./lib/googleAction').actionMap;
const subCategoryAction = require('./lib/googleAction').subCategoryAction;
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{

    if(req.body.originalRequest.source == 'google'){
        if(req.body.result.action == "createIncident.category"){
            subCategoryAction(req, res);
        } else{
            const app = new DialogflowApp({ request: req, response: res });
            app.handleRequest(googleActionMap);
        }
        
    } else if(req.body.originalRequest.source == 'facebook'){
        if(req.object.page.entry.messaging.postback || req.body.object.page.entry.messaging.postback){
            console.log('1 ',req.object, req.body);
        }
        console.log('2 ',JSON.stringify(req.object), JSON.stringify(req.body.object));
        console.log('ACTIOn NAME ', req.body.result.action);
        return facebookActions[req.body.result.action](req, res);
    }
});


app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});
