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
    }
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

module.exports = actionObject;