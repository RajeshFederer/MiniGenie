const request = require('request');

let data = require('./data/inicdentData');
let serviceNow = require('./service/service_now');

let welcomeIntent = (app) => {
    console.log('I am In Welcome');
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Hey! I'm the Mini Genie Bot. I can help you to create and check incidents. What do you want to do?")
            .addBasicCard(app.buildBasicCard()
                 .setTitle("Welcome to Mini Genie")
                 .setImage('https://www.askideas.com/media/13/Welcome-3d-Text-Picture.jpg', 'Welcome')
            )
            .addSuggestions(['Create Incident', 'Check My Incident'])
         );
};

let createIncident = (app) =>{
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Alright! Choose Category")
            .addSuggestions(['Hardware', 'Software', 'Network', 'Inquiry'])
         );
};

let askSubCategory = (app) =>{
    console.log('ILLAI', app);
    console.log("POP", JSON.stringify(app.body_));
    // app.ask(
    //     app.buildRichResponse()
    //         .addSimpleResponse("Please Choose Sub Category")
    //         .addSuggestions(data.subCategories[app.body_.result.parameters.category])
    //      );

    let subCategories = data.subCategories[app.body_.result.parameters.category];
    let items = [];
    subCategories.forEach((subCat)=>{
        items.push(app.buildOptionItem(subCat,[subCat])
            .setTitle(subCat)
            .setDescription(subCat+ ' related issues')
            .setImage('https://www.easeus.com/images_2016/classify_page/hardware.jpg',subCat))
    });
    app.askWithCarousel('Please Choose Sub Category',
        app.buildCarousel()
        .addItems(items)
    );
};

let askSubCCategory = (req, res) =>{
    
    console.log('ILLAI', req.body.result);
    let subCategories = data.subCategories[req.body.result.parameters.category];
    let items = [];
    
    subCategories.forEach((subCat)=>{
        items.push({
            "optionInfo": {
              "key": subCat,
              "synonyms": [subCat]
            },
            "title": subCat,
            "description": subCat +" related Issues",
            "image": {
              "url": "https://www.easeus.com/images_2016/classify_page/hardware.jpg"
            }
          });
    });
    console.log('ITEMS ', items);
    return res.json({
        "speech":"",
        "messages":[
            {
                "type": "simple_response",
                "platform": "google",
                "textToSpeech": "Choose"
            },
            {
                "type": "carousel_card",
                "platform": "google",
                "items": items
            }
        ]
    });
    // app.askWithCarousel('Please Choose Sub Category',
    //     app.buildCarousel()
    //     .addItems(items)
    // );
};

let askImpact = (app) =>{
    console.log('I am in', app.getSelectedOption() ,app.body_.result.parameters);
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Oh! Select Impact")
            .addSuggestions(["High", "Medium", 'Low'])
    )    
};

let askUrgency = (app) =>{
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Please Select Urgency")
            .addSuggestions(["High", "Medium", 'Low'])
    )
};

let logIncident = (app) =>{
  console.log('I am in ');
  // if(!app.body_.result.parameters.urgency){

  // } else if(app.body_.result.parameters.urgency && !app.body_.result.parameters.empId) {

  // } else if(app.body_.result.parameters.urgency && app.body_.result.parameters.empId) {

  // } else{
  //   console.log('NEVER');
  // }
  let contexts = app.body_.result.contexts;
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
    let incidentNo = body.result.number;
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Yeah! Your Incident has been logged. Your Incident Number is "+ incidentNo)
            .addBasicCard(app.buildBasicCard()
                 .setTitle("Your Incident Number is "+ incidentNo)
                 .setSubtitle("Please note it to know the status")
                 .setImage('https://thumbs.dreamstime.com/z/d-guy-showing-text-spelling-completed-check-mark-30276420.jpg', 'Success')
            )
            .addSimpleResponse("Would you like to do more ?")
            .addSuggestions(["Yes", "No"])
    )
    })
   .catch(err =>{
        return res.json(data.serverError);
      })
};

let yesQuestion = (app) => {
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("What do you want to do?")
            .addSuggestions(['Create Incident', 'Check My Incident'])
         );
};

let noQuestion = (app) => {
    app.ask(
        app.buildRichResponse()
        .addSimpleResponse("Good Bye! See you again.")
    );
};

let getIncident = (req, res) =>{
    let incidentNo = req.body.result.parameters.incidentNo.toString().toUpperCase();
    incidentNo = incidentNo.replace(/ /g,'');
    if(incidentNo.indexOf('INC') != 0) {
      //console.log('I AM IN 1', req.body.result.parameters.incidentNo, req.body.result.parameters.incidentNo.indexOf('INC'));
      let resObj =  {
        "speech": "Incident No should be start with INC. Example : INC00. Please Try Again",
        "messages" :[{
            "type": "simple_response",
            "platform": "google",
            "textToSpeech": "Please find status of "+ incidentNo +" below."
        }],      
        followupEvent :{
            "name" : "getIncident",
            "data" : {incidentReqType:"VIEW"}
        }
      };
      return res.json(resObj);
    } else{
    let serviceNowUrl = 'https://dev18442.service-now.com/api/now/v1/table/incident?number='+incidentNo;
    
    serviceNow.callServiceNow(serviceNowUrl, "GET")
    .then(body => {
      if(body && body["result"]){
        let resObj = {
          "speech": "Incident No : "+ incidentNo,
          "messages": [
            {
                "type": "simple_response",
                "platform": "google",
                "textToSpeech": "Please find status of "+ incidentNo+" below."
            },
            {
                "type": "basic_card",
                "platform": "google",
                "title": "Incident No : "+ incidentNo,
                "subtitle": "Status : " + data.status[body.result[0].state].toUpperCase(),
                "formattedText": "Priority : " + data.status[body.result[0].priority].toUpperCase(),
                "image": {
                  "url" : "http://passionfire.com/wp-content/uploads/2012/08/mlm-right-person.jpg"
                },
                "buttons": []
            },
            {
                "type": "simple_response",
                "platform": "google",
                "textToSpeech": "Would you like to do more ?"
            },
            {
                "type": "suggestion_chips",
                "platform": "google",
                "suggestions": [
                  {
                    "title": "Yes"
                  },
                  {
                    "title": "No"
                  }
                ]
            }
          ]
        };
        return res.json(resObj);
      } else if(body && body["error"]){
        let resObj =  {
          "speech": "Incident No : "+ incidentNo,
          "displayText":"Incident No : "+ incidentNo,
          "messages" :[{
            "type": "simple_response",
            "platform": "google",
            "textToSpeech": "Invalid Incident Number. Please Check and try again."
        }],
          followupEvent :{
                  "name" : "getIncident",
                  "data" : {}
          }
        };
        return res.json(resObj);
      } else {
        let resObj =  {
          "speech": "Incident No : "+ incidentNo,
          "messages": [{
            "type": "simple_response",
            "platform": "google",
            "textToSpeech": "Invalid Incident Number. Please Check and try again."
          },
          {
            "type": "simple_response",
            "platform": "google",
            "textToSpeech": "Would you like to do more ?"
        },
        {
            "type": "suggestion_chips",
            "platform": "google",
            "suggestions": [
              {
                "title": "Yes"
              },
              {
                "title": "No"
              }
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

let itemSelected =(app) => {
  // Get the user's selection
  const param = app.getContextArgument('actions_intent_option',
    'OPTION').value;
  console.log('YEAH ',app.body_.result);
  // Compare the user's selections to each of the item's keys
  if (!param) {
    app.ask('You did not select any item from the list or carousel');
  } else if (param === 'MATH_AND_PRIME') {
    app.ask('42 is an abundant number because the sum of its…');
  } else if (param === 'EGYPT') {
    app.ask('42 gods who ruled on the fate of the dead in the ');
  } else if (param === 'RECIPES') {
    app.ask('Here\'s a beautifully simple recipe that\'s full ');
  } else {
    app.ask('You selected an unknown item from the list or carousel');
  }
}

let categoryCustomAction = (req, res) =>{
  console.log(JSON.stringify(req.body.result));
  const param = app.getContextArgument('actions_intent_option',
    'OPTION').value;
    console.log('ONE ', param);
    let resObj =  {
      "speech": "Incident No should be start with INC. Example : INC00. Please Try Again",
      "messages" :[{
          "type": "simple_response",
          "platform": "google",
          "textToSpeech": "Please find status of "+ incidentNo +" below."
      }],      
      followupEvent :{
          "name" : "addSubCategory ",
          "data" : {}
      }
    };
    return res.json(resObj);
};

const actionMap = new Map();
actionMap.set('Welcome', welcomeIntent);
actionMap.set('createIncident', createIncident);
actionMap.set('createIncident.category', askSubCategory);
actionMap.set('createIncident.subCategory', askImpact);
actionMap.set('createIncident.impact', askUrgency);
actionMap.set('createIncident.urgeny', logIncident);
actionMap.set('createIncident.moreQuestionYes', yesQuestion);
actionMap.set('createIncident.urgeny.createIncidenturgeny-no', noQuestion);
actionMap.set('createIncident.urgeny - no', noQuestion);
actionMap.set('getIncident - yes', yesQuestion);
actionMap.set('getIncident.yes', yesQuestion);
actionMap.set('getIncident - no', noQuestion);
actionMap.set('getIncident.no', noQuestion);
actionMap.set('actions_intent_OPTION',itemSelected);

module.exports.actionMap = actionMap;
module.exports.actionFunctions = {
  subCategoryAction : askSubCCategory,
  getIncident : getIncident,
  categoryCustomAction : categoryCustomAction
};