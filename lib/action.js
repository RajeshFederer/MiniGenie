'use strict';
let data = require('./data/inicdentData');
let actionObject = {};

actionObject.Welcome = (req, res) =>{
    let resObj = {
        speech:"Hey! I'm the Mini Genie Bot. I can help you to create/check incidents. Tell me what I can do for you. Create New Incident or Check Incidents",
        messages: [
            {
              "type": 2,
              "platform": "facebook",
              "title": "Hey! I'm the Mini Genie Bot. I can help you to create/check incidents",
              "replies": [
                "Create Incident",
                "Check My Incidents"
              ]
            },
            {
              "type": 0,
              "speech": "Hey! I'm the Mini Genie Bot. I can help you to create/check incidents. Tell me what I can do for you. Create New Incident(type \"NEW\") Check Incidents(type \"VIEW\")"
            }
          ]
    };
    return res.json(resObj);
};

actionObject['createIncident.category'] = (req, res) => {
    console.log(JSON.stringify(req.body));
    let subCategories = data.subCategories[req.body.result.parameters.category];
    let resObj = {"speech": "Please tell me your SubCategory from the following",
    "messages": [
      {
        "type": 2,
        "platform": "facebook",
        "title": "Enter Sub Category",
        "replies": subCategories
      },
      {
        "type": 0,
        "speech": "Please tell me your SubCategory from the following"
      },
      {
        "type": 0,
        "speech": "* AntiVirus"
      },
      {
        "type": 0,
        "speech": "* Email"
      },
      {
        "type": 0,
        "speech": "* Internet Application"
      },
      {
        "type": 0,
        "speech": "* IP Address"
      },
      {
        "type": 0,
        "speech": "* DNS"
      },
      {
        "type": 0,
        "speech": "* CPU"
      },
      {
        "type": 0,
        "speech": "* Memory"
      }
    ]
    };
    return res.json(resObj);
};

actionObject['createIncident.urgeny'] = (req, res) => {
    /*
    if(req.body.result.parameters.empId > 1000 && req.body.result.parameters.empId < 50000){
        return res.json({
            speech:"Employee Id should be between 1000 to 50000",
            messages: [
                {
                  "type": 2,
                  "platform": "facebook",
                  "speech": "What is the empId?"
                },
                {
                  "type": 0,
                  "speech": "Employee Id should be between 1000 to 50000"
                }
              ]
        });
    } else {
        */console.log('URGENCY LOG', JSON.stringify(req.body.result));
        let resObj = {
            "speech": "Your Incident No is INC0006541. Please note it to know the status",
          "messages": [
            {
              "type": 0,
              "platform": "facebook",
              "speech": "Done! Your Incident has been logged."
            },
            {
              "type": 1,
              "platform": "facebook",
                 "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title": "Your Incident No is INC0006541",
              
                "image_url": "https://findreallove.files.wordpress.com/2010/03/succes.jpg",
               "subtitle": "Please note it to know the status",
            "buttons":[             
            ]      
          }
        ]
      }
    }
            },
            {
              "type": 2,
              "platform": "facebook",
              "title": "Would you like to do more ?",
              "replies": [
                "Yes",
                "No"
              ]
            },
            {
              "type": 0,
              "speech": "Done! Your Incident has been logged"
            },
            {
              "type": 0,
              "speech": "Your Incident No is INC0006541. Please note it to know the status"
            },
            {
              "type": 0,
              "speech": "Would you like to do more ?"
            }
          ]
        }
        return res.json(resObj);
    //}
};

module.exports = actionObject;
