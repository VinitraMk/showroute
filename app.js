//var PAGE_ACCESS_TOKEN =  process.env.PAGE_ACCESS_TOKEN;
//var APIAI_TOKEN = process.env.APIAI_TOKEN;
var PAGE_ACCESS_TOKEN="EAAWkJ8cZAZCpUBABttsI5sZCE6dLDDoQ4nwSTrUlCWDOSeCFcDeeJdV9QPZBEmaCPdipzg4ZBKB7Grh8NWEg8gPtBmcwgcwly73xJuhUdHz5j4JSDERsJ1ZCiusQqIYohbZCph9BIPylDcJBixZCRZBB0ZCPPE3Pza5aC6vQ7QrlcRFspvM0Tz8fI6"
var APIAI_TOKEN="e649f8bb7b244a3b832c62d4e3c861eb"

var express=require('express');
var bodyparser=require('body-parser');
var apiai=require('apiai');
var app=express();
var feedback=require('./feedback.js');

// var MongoClient = require('mongodb').MongoClient;

app.use(
    bodyparser.urlencoded({
        extended:true
    })
);

app.use(bodyparser.json());
var port=process.env.PORT || 8081;

const apiaiApp = apiai(APIAI_TOKEN);

/* For Facebook Validation
  webhook for facebook
*/
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'gon_killua') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */

app.post('/webhook', (req, res) => {
    console.log('webhook');
  if (req.body.object === 'page') {
      console.log('page');
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
            console.log('send');
          receivedMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

/* GET query from API.ai */

function receivedMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'shawnthesheep'
  });

  apiai.on('response', (response) => {
    let aiText = response.result.fulfillment.speech;
    sendMessage(sender, aiText);

  });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}

function sendMessage(sender,aiText) {
  let messageData = {
    recipient: {id: sender},
    message: {text: aiText}
  };

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData
  }, (error, response) => {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

/* Webhook for API.ai  */
app.post('/ai', (req, res) => {
  console.log('*** Webhook for api.ai query ***');
  console.log(req.body.result);
        // console.log(req.body.result)
  var str=JSON.stringify(req.body.result.parameters);
    /*return res.json({
      speech: str,
      displayText: "dummy value"
    });*/
  res.send(JSON.stringify({
      "speech":str,
      "displayText":"dummy value"
  }));
});

app.get('/',function(req,res) {
    res.send('hello');
})

app.get('testing',(req,res)=>{
  res.send('testing the endpoint')
})
var server=app.listen(port,function() {
    var host=server.address().address;
    var port=server.address().port;
    console.log('Listening on port 8081...');
})

