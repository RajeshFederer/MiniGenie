'use strict';

const request = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const Auth0Strategy = require('passport-auth0');
const passport = require('passport');
const requestModule = require('request');
const path = require('path');
const fs = require('fs');

const DialogflowApp = require('actions-on-google').DialogflowApp;
const facebookActions = require('./lib/facebookAction');
const slackActions = require('./lib/slackAction');
const googleActionMap = require('./lib/googleAction').actionMap;
const googleActionFunctions = require('./lib/googleAction').actionFunctions;
const data = require('./lib/data/inicdentData');

let accountLinkingToken, redirectURI, recipientId;
const strategy = new Auth0Strategy(
    {
        domain: data.authO.domain,
        clientID: data.authO.clientId,
        clientSecret: data.authO.clientSecret,
        callbackURL: data.authO.callbackUrl
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);
passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.post('/', (req, res) =>{
    
    if(req.body.originalRequest.source == 'google'){
        console.log('ENTER');
        const app = new DialogflowApp({ request: req, response: res });
         if(req.body.result.action == "getIncident"){
             return googleActionFunctions.getIncident(req, res);
         } else if(req.body.result.action == 'createIncidentcategory.custom'){
            const params = app.getSelectedOption();
            const param = app.getContextArgument('actions_intent_option', 'OPTION').value;
            console.log('TEST', param, params);
            req.subCategory = param;
            return googleActionFunctions.categoryCustomAction(req, res);
         } else{
            app.handleRequest(googleActionMap);
        }
    } else if(req.body.originalRequest.source == 'facebook'){
        recipientId = recipientId || req.body.originalRequest.data.sender.id;
        console.log('REC ', recipientId);
        // if(req.object.page.entry.messaging.postback || req.body.object.page.entry.messaging.postback){
        //     console.log('1 ',req.object, req.body);
        // }
        console.log('ACTIOn NAME ', req.body.result.action);
        return facebookActions[req.body.result.action](req, res, recipientId);
    } else if(req.body.originalRequest.source == 'slack'){
        return slackActions[req.body.result.action](req, res);
    }
});

app.get('/authorize', passport.authenticate('auth0', {
    clientID: data.authO.clientId,
    domain: data.authO.domain,
    redirectUri: data.authO.callbackUrl,
    responseType: 'code',
    audience: 'https://' + data.authO.domain + '/userinfo',
    scope: 'openid profile'
}));

app.get('/login', (req, res) => {
    console.log('Body ',req.query);
    accountLinkingToken = req.query.account_linking_token;
    redirectURI = req.query.redirect_uri;
    res.redirect('/authorize');
});

app.get('/callback', passport.authenticate('auth0', {}), (req, res) => {
    console.log('CALLBACK ' + redirectURI, req, JSON.stringify(req.user));
    sendWelcomeMessage(req.user.displayName, recipientId);
    res.redirect(redirectURI + '&authorization_code=123Raj12');
});

app.get('/showlog', (req, res) =>{
    let type = "fb", fileName = "USER-2131494240194398";
    if(req.query.type){
        type = req.query.type;
    }
    if(req.query.senderId){
        fileName = "USER-" + req.query.senderId;
    }
    fs.readFile(path.join(__dirname , "/lib/logs/"+ type+"/"+ fileName+".log"), "utf8", (err, resp) =>{
        console.log('CHATLOG RESP ', err, resp);
        if(err) {
            return res.json({statusCode:500, message : err});
        } else {
            return res.json({statusCode: 200, message : resp})
        }
    });
});

app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});

function sendWelcomeMessage(userName, recipientId){
    requestModule({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: data.fbPageAccessToken},
        method: 'POST',
        json: {
            recipient: {
                id: recipientId,
            },
            message :{
                "text" :'Welcome '+ userName 
            }
        }
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // Message has been successfully received by Facebook.
          console.log(
            `Successfully sent message to `,
            JSON.stringify(body)
          );
        } else {
          // Message has not been successfully received by Facebook.
          console.error(
            `Failed calling Messenger API endpoint`,
            response.statusCode,
            response.statusMessage,
            body.error
          );
        }
      });
}