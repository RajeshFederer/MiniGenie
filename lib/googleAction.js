let welcomeIntent = (app) => {
    console.log('I am In Welcome');
    // app.tell({
    //     speech: "Test Hey! I'm the Mini Genie Bot. I can help you to create/check incidents",
    //     displayText: "Test Hey! I'm the Mini Genie Bot. I can help you to create/check incidents"
    // });
    console.log('In Welcome Intent');
    app.ask(app.buildRichResponse()
             .addSimpleResponse("Hey! I'm the Mini Genie Bot. I can help you to create / check incidents")
             .addBasicCard(app.buildBasicCard()
                 .setTitle("Welcome to Mini Genie")
                 .setImage('https://www.askideas.com/media/13/Welcome-3d-Text-Picture.jpg', 'Welcome')
             )
             .addSuggestions(['Create Incident', 'Check My Incident'])
         );
};

const actionMap = new Map();
actionMap.set('Welcome', welcomeIntent);

module.exports = actionMap;