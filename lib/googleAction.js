let welcomeIntent = (app) => {
    console.log('I am In Welcome');
    app.tell({
        speech: "Hey! I'm the Mini Genie Bot. I can help you to create/check incidents",
        displayText: "Hey! I'm the Mini Genie Bot. I can help you to create/check incidents"
    });
};

const actionMap = new Map();
actionMap.set('Welcome', welcomeIntent);
app.handleRequest(actionMap);

module.exports = actionMap;