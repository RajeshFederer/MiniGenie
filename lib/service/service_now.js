'use strict';

const request = require('request');

module.exports.callServiceNow = (url, method, body) =>{

    let options = {
        method : method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Accept':'application/json',
            'Authorization': 'Basic ' + new Buffer('33238:abc123').toString('base64')
        },
        json : true
    };
    if (method == "POST" && body){
        options.body = body;
    }
    
    request(options, function (err, response, body) {
        if (err){
            return Promise.reject(err);
        } else {
            return Promise.resolve(body);
        }
    });
};