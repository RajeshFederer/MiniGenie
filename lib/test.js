const request = require('request');

var options = {
    method : "POST",
    url: 'https://dev18442.service-now.com/api/now/v2/table/incident',
    headers: {
        'Content-Type': 'application/json',
        'Accept':'application/json',
        'Authorization': 'Basic ' + new Buffer('33238:abc123').toString('base64')
    },
    json : true,
    body: {"short_description":"Unable to connect to office wifi","assignment_group":"287ebd7da9fe198100f92cc8d1d2154e","urgency":"2","impact":"2"}
};

// request(options, function (err, response, body) {
//     console.log('CHECK',err,body);
// });



let optionss = {
    method : "GET",
    url: 'https://dev18442.service-now.com/api/now/v1/table/incident/663sfb4ffffd64f4013008a812ed18110c73c',
    headers: {
        'Content-Type': 'application/json',
        'Accept':'application/json',
        'Authorization': 'Basic ' + new Buffer('33238:abc123').toString('base64')
    }
};

// request(optionss, function (err, response, body) {
//   console.log('RESP', body);
// });

let a ="b"+  "\nc";
console.log(a);