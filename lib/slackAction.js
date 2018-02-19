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
                "type": 0,
                "platform": "slack",
                "speech": "Hey! I'm the Mini Genie Bot"
              },
              {
                "type": 3,
                "platform": "slack",
                "imageUrl": "https://www.askideas.com/media/13/Welcome-3d-Text-Picture.jpg"
              },
              {
                "type": 2,
                "platform": "slack",
                "title": "I can help you to create/check incidents. What do you want to do?",
                "replies": [
                  "Create Incident",
                  "Check Incident"
                ]
              }
          ]
    };
    return res.json(resObj);
};

actionObject['createIncident.category'] = (req, res) => {
    let subCategories = data.subCategories[req.body.result.parameters.category];
    console.log('CATEGORY ', subCategories);
    let resObj = {"speech": "Please tell me your SubCategory from the following",
    "messages": [
      {
        "type": 2,
        "platform": "slack",
        "title": "Enter Sub Category",
        "replies": subCategories
      }]
    };
    return res.json(resObj);
};

actionObject['createIncident.impact'] = (req, res) => {
    let resObj = {"speech": "Select Urgency",
    "messages": [
      {
        "type": 2,
        "platform": "slack",
        "title": "Select Urgrncy",
          "imageUrl": "",
          "buttons": [
            {
              "text": "High",
              "postback": "High"
            },
            {
              "text": "Medium",
              "postback": "Medium"
            },
            {
              "text": "Low",
              "postback": "Low"
            }
          ]
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
              "platform": "slack",
              "speech": "Done! Your Incident has been logged."
            },
            {
              "type": 1,
              "platform": "slack",
              "title": "Your Incident No is "+ incidentNo,
              "subtitle": "Please note it to know the status",
              "imageUrl": "https://thumbs.dreamstime.com/z/d-guy-showing-text-spelling-completed-check-mark-30276420.jpg",
              "buttons": []
            },
            {
              "type": 2,
              "platform": "slack",
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
    let incidentNo = req.body.result.parameters.incidentNo.toString().toUpperCase();
    if(incidentNo.indexOf('INC') != 0) {
      //console.log('I AM IN 1', req.body.result.parameters.incidentNo, req.body.result.parameters.incidentNo.indexOf('INC'));
      let resObj =  {
        "speech": "Incident No should be start with INC. Example : INC00. Please Try Again",      
        followupEvent :{
            "name" : "getIncident",
            "data" : {incidentReqType:"VIEW"}
        }
      };
      return res.json(resObj);
    } else{
    let serviceNowUrl = 'https://dev18442.service-now.com/api/now/v1/table/incident?number='+req.body.result.parameters.incidentNo.toUpperCase();
    
    serviceNow.callServiceNow(serviceNowUrl, "GET")
    .then(body => {
      if(body && body["result"]){
        let resObj = {
          "speech": "Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase(),
          "messages": [
            {
              "type": 0,
              "platform": "slack",
              "speech": "Please find status of "+ req.body.result.parameters.incidentNo.toUpperCase()+" below."
            },
            {
              "type": 4,
              "platform": "slack",
              "payload": {
                "slack": {
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
              "platform": "slack",
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
          "speech": "Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase(),
          "displayText":"Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase(),
          "messages": [{
            "type": 0,
            "platform": "slack",
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
          "speech": "Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase(),
          "messages": [{
            "type": 0,
            "platform": "slack",
            "speech": "Invalid Incident No. Please Check and try again."
          },
          {
            "type": 2,
            "platform": "slack",
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