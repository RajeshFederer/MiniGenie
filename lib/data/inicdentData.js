module.exports = {
    authO :{
        domain : 'minigenie.auth0.com',
        clientId : 'JkNu70ATKEN49ZOOMlTjGXmz1v46SKJP',
        clientSecret : 'IzF6eqWHM5GetbKU_vPmURZ0OiezfJcqibpSHxxTfyW1oLr9hrxKRVc4h-EBu54X',
        callbackUrl : 'https://minigenie.herokuapp.com/callback'
    },
    fbPageAccessToken : 'EAAdgXV82cJsBAPseIkhRvEWzawPslgypCr8T7VBYEnlzCT7BSqWaigM5iiHokVSH2MhyDjWNVAn8ZB9bZA9xylu33rs6JyOmIbMy8EiIZCOAQpVj3uxvDZCtyxegkGlZCZCV4ZAPnLLPMdTvhUrrs6cluUzZBZBnEXMIOOnq5humcq08g1wrNBGgP',
    subCategories : {
        "hardware" :["CPU","Disk","Keyboard", "Memory", "Monitor", "Mouse"],
        "software" :["Email", "Operating System"],
        "inquiry"  :["Antivirus", "Email", "Internal Application"],
        "network" : ["DHCP", "DNS", "IP Address", "VPN", "Wireless"]
    },
    "SubCategoryImages":{
        "CPU":""
    },
    urgency :{
        "High": "1",
        "Medium" : "2",
        "Low": "3"
    },
    impact :{
        "High": "1",
        "Medium" : "2",
        "Low": "3"
    },
    status :{
        "1" : "New",
        "2" : "In Progress",
        "3" : "On hold",
        "4" : "Resolved",
        "5" : "Closed",
        "6" : "Cancelled"
    },
    priority :{
        "1": "Critical",
        "2": "High",
        "3": "Moderate",
        "4": "Low",
        "5": "Planning"
    },
    serverError :{
        "speech": "Perblem in Server. Please Try Again",
        "displayText": "Perblem in Server. Please Try Again",
        "messages": [{
          "type": 0,
          "platform": "facebook",
          "speech": "Perblem in Server. Please Try Again"
        },
        {
          "type": 2,
          "platform": "facebook",
          "title": "Would you like to do more ?",
          "replies": [
            "Yes",
            "No"
          ]
        },
        {
          "type": 0,
          "speech": "Perblem in Server. Please Try Again"
        },
        {
          "type": 0,
          "speech": "Would you like to do more ?"
        }]
    }
};