const request = require('request');

let data = require('./data/inicdentData');
let serviceNow = require('./service/service_now');

let welcomeIntent = (app) => {
    console.log('I am In Welcome');
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Hey! I'm the Mini Genie Bot. I can help you to create / check incidents")
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

/*let askSubCategory = (app) =>{
    console.log('ILLAI', app);
    console.log("POP", JSON.stringify(app.body_));
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
};*/

let askImpact = (app) =>{
    console.log('I am in',app.body_.result.parameters);
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Select Impact")
            .addSuggestions(["High", "Medium", 'Low'])
    )    
};

let askUrgency = (app) =>{
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Select Impact")
            .addSuggestions(["High", "Medium", 'Low'])
    )
};

let logIncident = (app) =>{

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
            .addSimpleResponse("Yeah! Your Incident has been logged.")
            .addBasicCard(app.buildBasicCard()
                 .setTitle("Your Incident No is "+ incidentNo)
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
            .addSimpleResponse("What do you want me to do?")
            .addSuggestions(['Create Incident', 'Check My Incident'])
         );
};

let noQuestion = (app) => {
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Good Bye! See you again.")
         );
};

let getIncident = (app) =>{

};

const actionMap = new Map();
actionMap.set('Welcome', welcomeIntent);
actionMap.set('createIncident', createIncident);
//actionMap.set('createIncident.category', askSubCategory);
actionMap.set('createIncident.subCategory', askImpact);
actionMap.set('createIncident.impact', askUrgency);
actionMap.set('createIncident.urgeny', logIncident);
actionMap.set('createIncident.moreQuestionYes', yesQuestion);
actionMap.set('createIncident.urgeny.createIncidenturgeny-no', noQuestion);
actionMap.set('getIncident', getIncident);

module.exports = actionMap;