'use strict';

const request = require('request');

let data = require('./data/inicdentData');
let serviceNow = require('./service/service_now');
let actionObject = {};

actionObject.Welcome = (req, res) =>{
    let resObj = {
        speech:"Hey! I'm The Mini Genie Bot. I can help you to create/check incidents. Tell me what I can do for you. Create New Incident or Check Incidents",
        messages: [
            {
              "type": 2,
              "platform": "facebook",
              "title": "Hey! I'm The Mini Genie Bot. I can help you to create/check incidents",
              "replies": [
                "Create Incident",
                "Check My Incidents"
              ]
            },
            {
              "type": 0,
              "speech": "Hey! I'm The Mini Genie Bot. I can help you to create/check incidents. Tell me what I can do for you. Create New Incident(type \"NEW\") Check Incidents(type \"VIEW\")"
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
      }]
    };
    return res.json(resObj);
};

actionObject['createIncident.urgeny'] = (req, res) => {
  let contexts = req.body.result.contexts;
  console.log('CONTEXT ',contexts);
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
  
  let serviceNowUrl = 'https://dev18442.service-now.com/api/now/v1/table/incident';
  serviceNow.callServiceNow(serviceNowUrl, "POST" , reqObj)
  .then(body =>{
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
          }]
      };
      return res.json(resObj);
  })
  .catch(err =>{
    return res.json(data.serverError);
  })
};

actionObject.getIncident = (req, res) =>{
  
  if(req.body.result.parameters.incidentNo.indexOf('INC') != 0){
    console.log('I AM IN 1');
    let resObj =  {
      "speech": "Invalid Type of Incident No. Incident Number starts with INC",
      "displayText":"Invalid Type of Incident No. Incident Number starts with INC",
      "messages": [{
        "type": 0,
        "platform": "facebook",
        "speech": "Invalid Incident No. Please Check and try again."
      }],
      followupEvent :{
              "name" : "getIncident",
              "data" : {}
      }
    };
    return res.json(resObj);
  } 
  else{
    console.log('I AM IN 2');
  let serviceNowUrl = 'https://dev18442.service-now.com/api/now/v1/table/incident?number='+req.body.result.parameters.incidentNo;
  
  serviceNow.callServiceNow(serviceNowUrl, "GET")
  .then(body => {
    if(body && body["result"]){
      let resObj = {
        "speech": "Incident No : "+ req.body.result.parameters.incidentNo,
        "messages": [
          {
            "type": 0,
            "platform": "facebook",
            "speech": "Please find status of "+ req.body.result.parameters.incidentNo+" below."
          },
          {
            "type": 4,
            "platform": "facebook",
            "payload": {
              "facebook": {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [
                      {
                        "title": "Status",
                        "subtitle": data.status[body.result[0].state] ? data.status[body.result[0].state] : "CLOSED"
                      },
                      {
                        "title": "Priority",
                        "subtitle": data.priority[body.result[0].priority] ? data.priority[body.result[0].priority] : "CLOSED"
                      },
                      {
                        "title": "Created On",
                        "subtitle": body.result[0].sys_created_on
                      },
                      {
                        "title": "Updated On",
                        "subtitle": body.result[0].sys_updated_on
                      }
                    ]
                  }
                }
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
          }
        ]
      };
      return res.json(resObj);
    } else if(body && body["error"]){
      let resObj =  {
        "speech": "Incident No : "+ req.body.result.parameters.incidentNo,
        "displayText":"Incident No : "+ req.body.result.parameters.incidentNo,
        "messages": [{
          "type": 0,
          "platform": "facebook",
          "speech": "Invalid Incident No. Please Check and try again."
        }],
        followupEvent :{
                "name" : "getIncident",
                "data" : {}
        }
      };
      return res.json(resObj);
    } else {
      let resObj =  {
        "speech": "Incident No : "+ req.body.result.parameters.incidentNo,
        "messages": [{
          "type": 0,
          "platform": "facebook",
          "speech": "Invalid Incident No. Please Check and try again."
        },
        {
          "type": 2,
          "platform": "facebook",
          "title": "Would you like to do more ?",
          "replies": [
            "Yes",
            "No"
          ]
        }]
      };
      return res.json(resObj);
    }
  })
  .catch(err =>{
    return res.json(data.serverError);
  })
}
};

module.exports = actionObject;