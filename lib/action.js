'use strict';
const request = require('request');
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
  let contexts = req.body.result.contexts;
  //console.log('CONTEXT ',req.body.result);
  let reqObj = {};

  contexts.forEach(element => {
    let parameters = element.parameters;
    if(parameters.category){
      reqObj.category = parameters.category;
    }
    if(parameters.subCategory){
      reqObj.subcategory = parameters.subCategory;
    }
    if(parameters.impact){
      reqObj.impact = data.impact[parameters.impact];
    }
    if(parameters.urgency){
      reqObj.urgency = data.urgency[parameters.urgency];
    }
    if(parameters.description){
      reqObj.short_description = parameters.description;
    }
    reqObj.assignment_group = "287ebd7da9fe198100f92cc8d1d2154e";
  });
  
  let options = {
    method : "POST",
    url: 'https://dev18442.service-now.com/api/now/v1/table/incident',
    headers: {
        'Content-Type': 'application/json',
        'Accept':'application/json',
        'Authorization': 'Basic ' + new Buffer('33238:abc123').toString('base64')
    },
    json : true,
    body: reqObj
};

request(options, function (err, response, body) {
  let incidentNo = body && body.result  ? body.result.number : "RANDOM";
  let resObj = {"speech": "Would you like to do more ?",
      "messages": [
        {
          "type": 0,
          "platform": "facebook",
          "speech": "Done! Your Incident has been logged."
        },
        {
          "type": 1,
          "platform": "facebook",
          "title": "Your Incident No is "+ incidentNo,
          "subtitle": "Please note it to know the status",
          "imageUrl": "https://thumbs.dreamstime.com/z/d-guy-showing-text-spelling-completed-check-mark-30276420.jpg",
          "buttons": []
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
          "speech": "Your Incident No is " + incidentNo+". Please note it to know the status"
        },
        {
          "type": 0,
          "speech": "Would you like to do more ?"
        }
      ]
    };
    return res.json(resObj);
});
};

actionObject.getIncident = (req, res) =>{
  let options = {
    method : "GET",
    url: 'https://dev18442.service-now.com/api/now/v1/table/incident/'+req.body.result.parameters.incidentNo,
    headers: {
        'Content-Type': 'application/json',
        'Accept':'application/json',
        'Authorization': 'Basic ' + new Buffer('33238:abc123').toString('base64')
    }
};

request(options, function (err, response, body) {
  console.log('RES',err, body);
  
    // return res.json(resObj);
});
};

module.exports = actionObject;
