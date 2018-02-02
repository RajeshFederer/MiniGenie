'use strict';

const request = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{

    if(req.body.result.action === "Welcome"){
        console.log('I AM IN');
        let resObj = {
            speech:'I am a bot',
            messages: [
                {
                  "type": 2,
                  "platform": "facebook",
                  "title": "HEY! I'm the Mini Genie Bot. I can help you to create/check incidents",
                  "replies": [
                    "Create Incident",
                    "Check My Incidents"
                  ]
                },
                {
                  "type": 0,
                  "speech": "Hey! I'm the Mini Genie Bot. I can help you to create/check incidents. Tell me what I can do for you. Create New Incident(type \"NEW\") Check My Incidents(type \"VIEW\")"
                }
              ]
        }
        return res.json(resObj);
    }

});


app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});
