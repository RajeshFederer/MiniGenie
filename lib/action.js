'use strict';

const request = require('request');

let data = require('./data/inicdentData');
let serviceNow = require('./service/service_now');
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
      }]
    };
    return res.json(resObj);
};

actionObject['createIncident.urgeny'] = (req, res) => {
  console.log("CALLED", req.body.result.parameters);
  let actionData ={};
  if(req.body.result.parameters.urgency){
    actionData.urgency = req.body.result.parameters.urgency;
  }
  if(req.body.result.parameters.empId){
    actionData.empId = req.body.result.parameters.empId;
  }
  if(!req.body.result.parameters.urgency){
    console.log('RECIVED EMPID ', req.body.result.parameters.urgency);
    return res.json({"speech":"Choose Urgency data","followupEvent": {
      "data": actionData,
      "name": "getEmpId"
    }});
  }
  else if(!req.body.result.parameters.empId){
    console.log('RECIVED EMPID ', req.body.result.parameters.empId);
    return res.json({"speech":"Enter your Employee Id","followupEvent": {
      "data": actionData,
      "name": "getEmpId"
    }});
  } else if(req.body.result.parameters.empId < 1000 || req.body.result.parameters.empId > 50000){
    console.log('RECIVED EMPID ', req.body.result.parameters.empId);
    return res.json({"speech":"Employee Id shoul be between 1000 to 50000. Please Try Again","followupEvent": {
      "data": actionData,
      "name": "getEmpId"
    }});
  } 
  else {
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
    let incidentNo = body && body.result  ? body.result.sys_id : "RANDOM";
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
  }
};

actionObject.getIncident = (req, res) =>{
  
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
                        "subtitle": data.status[body.result.state] ? data.status[body.result.state] : "CLOSED"
                      },
                      {
                        "title": "Priority",
                        "subtitle": data.priority[body.result.priority] ? data.priority[body.result.priority] : "CLOSED"
                      },
                      {
                        "title": "Created On",
                        "subtitle": body.result.sys_created_on
                      },
                      {
                        "title": "Updated On",
                        "subtitle": body.result.sys_updated_on
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
};

actionObject['myTest'] = (req, res) => {
  console.log("CALLED", req.body.result.parameters);
  if(!req.body.result.parameters.urgency){
    console.log('RECIVED EMPID ', req.body.result.parameters.empId);
    return res.json({"speech":"Choose Urgency","followupEvent": {
      "data": {},
      "name": "myEvent"
    }});
  }
  else if(!req.body.result.parameters.name){
    console.log('RECIVED NAME ', req.body.result.parameters.name);
    return res.json({"speech":"Enter your name","followupEvent": {
      "data": {urgency : req.body.result.parameters.urgency,empId : req.body.result.parameters.empId},
      "name": "myEvent"
    }});
  } else if(!req.body.result.parameters.empId){
    console.log('RECIVED EMPID ', req.body.result.parameters.empId);
    return res.json({"speech":"Enter your Employee Id","followupEvent": {
      "data": {urgency : req.body.result.parameters.urgency},
      "name": "myEvent"
    }});
  } else {
    let resObj =  {
      "speech": "Incident No : ",
      "messages": [{
        "type": 0,
        "platform": "facebook",
        "speech": "Success"
      }]
    };
    return res.json(resObj);
  }
};

module.exports = actionObject;