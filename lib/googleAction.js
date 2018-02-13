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

let askSubCategory = (app) =>{
    console.log('ILLAI', app);
    console.log("POP", JSON.stringify(app.body_));
    app.ask(
        app.buildRichResponse()
            .addSimpleResponse("Please Choose Sub Category")
            .addSuggestions(data.subCategories[app.body_.result.parameters.category])
    )    
};

let askImpact = (app) =>{
    console.log('IN');
    app.askWithCarousel('Alright! Here are a few things you can learn. Which sounds interesting?',
    // Build a carousel
    app.buildCarousel()
    // Add the first item to the carousel
    .addItems(app.buildOptionItem('HIGH',
      ['high'])
      .setTitle('High')
      .setDescription('42 is an abundant number because the sum of its ' +
        'proper divisors 54 is greater…')
      .setImage('http://example.com/math_and_prime.jpg', 'Math & prime numbers'))
    // Add the second item to the carousel
    .addItems(app.buildOptionItem('MEDIUM',
      ['medium'])
      .setTitle('Medium')
      .setDescription('42 gods who ruled on the fate of the dead in the ' +
        'afterworld. Throughout the under…')
      .setImage('http://example.com/egypt', 'Egypt')
    )
    // Add third item to the carousel
    .addItems(app.buildOptionItem('LOW',
      ['low'])
      .setTitle('Low')
      .setDescription('Here\'s a beautifully simple recipe that\'s full ' +
        'of flavor! All you need is some ginger and…')
      .setImage('http://example.com/recipe', 'Recipe')
    )
  );
};

let askUrgency = (app) =>{
    app.askWithCarousel('Select Urgency',
    app.buildCarousel()
    // Add the first item to the carousel
    .addItems(app.buildOptionItem('High',['1','2','3'])
      .setTitle('High1')
    )
    .addItems(app.buildOptionItem('Medium1',['1','2','3'])
      .setTitle('Medium1')
    )
    .addItems(app.buildOptionItem('Low',['1','2','3'])
      .setTitle('Low')
    )
  );
};

const actionMap = new Map();
actionMap.set('Welcome', welcomeIntent);
actionMap.set('createIncident', createIncident);
actionMap.set('createIncident.category', askSubCategory);
actionMap.set('createIncident.subCategory', askImpact);
actionMap.set('createIncident.impact', askUrgency);

module.exports = actionMap;