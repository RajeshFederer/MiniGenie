'use strict';

const request = require('request');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

let data = require('./data/inicdentData');
let serviceNow = require('./service/service_now');
let actionObject = {};

actionObject.Welcome = (req, res, recipientId) =>{
  console.log('LOG TEST',JSON.stringify(req.body));
  let welcomeMsg = "Hey! I'm The Mini Genie Bot. I can help you to create/check incidents. Tell me what I can do for you. Create New Incident or Check Incidents";
    let resObj = {
        speech: welcomeMsg,
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
    logChats(req, welcomeMsg);
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
    logChats(req, "Please tell me your SubCategory from the following");
    return res.json(resObj);
};

actionObject['input.unknown'] = (req, res) => {
  
  let resObj = {
    speech: "HEY! I can only help you to create/check incidents.",
    messages: [
      {
        "type": 2,
        "platform": "facebook",
        "title": "HEY! I can only help you to create/check incidents.",
        "replies": [
          "Create Incident",
          "Check My Incidents"
        ]
      }
      ]
  };
  logChats(req, "HEY! I can only help you to create/check incidents.");
  return res.json(resObj);
};

actionObject['createIncident.urgency'] = (req, res) => {
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
      logChats(req, "Done! Your Incident has been logged. Your Incident No is "+ incidentNo);
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
      speech: "Incident No should be start with INC. Example : INC0012459. Please Try Again",      
      followupEvent :{
          "name" : "getIncident",
          "data" : {incidentReqType:"VIEW"}
      }
    };
    logChats(req, "Incident No should be start with INC. Example : INC0012459. Please Try Again");
    return res.json(resObj);
  } else {
  let serviceNowUrl = 'https://dev18442.service-now.com/api/now/v1/table/incident?number='+req.body.result.parameters.incidentNo.toUpperCase();
  
  serviceNow.callServiceNow(serviceNowUrl, "GET")
  .then(body => {
    if(body && body["result"]){
      let resObj = {
        "speech": "Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase(),
        "messages": [
          {
            "type": 0,
            "platform": "facebook",
            "speech": "Please find status of "+ req.body.result.parameters.incidentNo.toUpperCase()+" below."
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
      logChats(req, "Please find status of "+ req.body.result.parameters.incidentNo.toUpperCase()+ " "+data.status[body.result[0].state] ? data.status[body.result[0].state] : "CLOSED");
      return res.json(resObj);
    } else if(body && body["error"]){
      console.log('INCIDENT NOT EXISTS ', req.body.result.parameters.incidentNo.toUpperCase());
      let resObj =  {
        speech: "Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase() + ". Please Check and try again.",
        displayText:"Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase()+ ". Please Check and try again.",
        messages: [{
          "type": 0,
          "platform": "facebook",
          "speech": "Invalid Incident No. Please Check and try again."
        }],
        followupEvent :{
                "name" : "getIncident",
                "data" : {incidentReqType:"VIEW"}
        }
      };
      logChats(req, "Invalid Incident No. Please Check and try again.");
      return res.json(resObj);
    } else {
      let resObj =  {
        "speech": "Incident No : "+ req.body.result.parameters.incidentNo.toUpperCase(),
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
      logChats(req, "Invalid Incident No. Please Check and try again.");
      return res.json(resObj);
    }
  })
  .catch(err =>{
    return res.json(data.serverError);
  })
}
};

actionObject.login = (req, res) =>{
  let resObj = {
    speech:"Click to Login!",
    messages: [
        {
          "type": 4,
          "platform": "facebook",
          "payload":{
            "facebook": {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "button",
                  "text": "Click to Login!",
                  "buttons": [
                    {
                      "type": "account_link",
                      "url": "https://accounts.google.com/ServiceLogin"
                    }
                  ]
                }
              }
            }
          }
        }
      ]
  };
  return res.json(resObj);
};

let logChats = (req, res) =>{
  req = req.body;
  let senderId = req.originalRequest.data.sender.id ? "USER-" + req.originalRequest.data.sender.id : "USER";
  console.log('I am in', senderId, res);
  let logDir = path.join(__dirname, '/logs/');
  if (!fs.existsSync(logDir)) {
    fs.mkdir(logDir,()=>{});
  }
  logDir = logDir + 'fb/';
  if (!fs.existsSync(logDir)) {
    fs.mkdir(logDir,()=>{});
  }

  let fileName = logDir + senderId +'.log';
  console.log('POLL', fileName);
  const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
      new winston.transports.File({
        filename: fileName,
        json: true
      })
    ]
  });
  logger.log('info',JSON.stringify({"from":senderId, "message": req.originalRequest.data.message.text, "time": moment(req.originalRequest.data.timestamp).format('DD-MM-YYYY HH:mm:ss')}));
  logger.log('info',JSON.stringify({"from":"BOT", "message": res, "time": moment(req.originalRequest.data.timestamp).format('DD-MM-YYYY HH:mm:ss')}));
}

module.exports = actionObject;