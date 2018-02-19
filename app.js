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
             return googleActionFunctions.categoryCustomAction(req, res);
         } else{
            const app = new DialogflowApp({ request: req, response: res });
            googleActionMap.set(app.StandardIntents.OPTION, () => {
                console.log('I am in');
                const param = app.getSelectedOption();
                if (!param) {
                  app.ask('You did not select any item from the list or carousel');
                } else if (param === 'MATH_AND_PRIME') {
                  app.ask('42 is an abundant number because the sum of its…');
                } else if (param === 'EGYPT') {
                  app.ask('42 gods who ruled on the fate of the dead in the...');
                } else if (param === 'RECIPES') {
                  app.ask('Here\'s a beautifully simple recipe that\'s full...');
                } else {
                  app.ask('You selected an unknown item from the list or carousel');
                }
              });
            app.handleRequest(googleActionMap);
        }
    } else if(req.body.originalRequest.source == 'facebook'){
        // if(req.object.page.entry.messaging.postback || req.body.object.page.entry.messaging.postback){
        //     console.log('1 ',req.object, req.body);
        // }
        console.log('ACTIOn NAME ', req.body.result.action);
        return facebookActions[req.body.result.action](req, res);
    }
});


app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});
