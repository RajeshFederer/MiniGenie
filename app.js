'use strict';

const request = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const DialogflowApp = require('actions-on-google').DialogflowApp;
const facebookActions = require('./lib/facebookAction');
const googleActionMap = require('./lib/googleAction').actionMap;
const googleActionFunctions = require('./lib/googleAction').actionFunctions;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{

    if(req.body.originalRequest.source == 'google'){
        console.log('ENTER');
         if(req.body.result.action == "getIncident"){
             return googleActionFunctions.getIncident(req, res);
         } else if(req.body.result.action == 'createIncidentcategory.custom'){
            const app = new DialogflowApp({ request: req, response: res });
            const params = app.getSelectedOption();
            const param = app.getContextArgument('actions_intent_option', 'OPTION').value;
            console.log('TEST', param, params);
            return googleActionFunctions.categoryCustomAction(req, res);
         } else{
            const app = new DialogflowApp({ request: req, response: res });
            app.handleRequest(googleActionMap);
        }
    } else if(req.body.originalRequest.source == 'facebook'){
        // if(req.object.page.entry.messaging.postback || req.body.object.page.entry.messaging.postback){
        //     console.log('1 ',req.object, req.body);
        // }
        console.log('ACTIOn NAME ', req.body.result.action);
        return facebookActions[req.body.result.action](req, res);
    } else {
        console.log('OUTSIDE');
    }
});


app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});
