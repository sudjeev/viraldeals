'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var path = require('path');

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname)));

// Index route
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/privacy', function (req, res) {
    res.sendFile(path.join(__dirname + '/privacy.html'));
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendTextMessage(sender, "Here are todays deals:")
            showDeals(sender);
        }

        if(event.postback) {
        	
        	console.log(event.postback)

        	switch (event.postback.payload) {        		
        		case "DOORDASH_COUPON":
        			sendShopButton(sender, "rmn", "DoorDash", "https://www.doordash.com/")
        		break;
        		case "AEROPOSTAL_COUPON":
        			sendShopButton(sender, "", "Aeropostal", "http://www.aeropostale.com/shop/index.jsp?categoryId=3534619")
        		break;
        		case "PACSUN_COUPON":
        			sendShopButton(sender, "RMNBTS16", "PacSun", "http://www.pacsun.com/on/demandware.store/Sites-pacsun-Site/default/Default-Start?XCID=a:OOTtr9mlaCk-_-482&ranEAID=OOTtr9mlaCk&ranMID=39758&ranSiteID=OOTtr9mlaCk-NnY53irDEWbAczyW3bGhLw")
        		break;
        		case "TARGET_COUPON":
        			sendShopButton(sender, "STYLE", "Target", "http://www.target.com/c/women-s-clothing/-/N-5xtcm?clkid=68ae8702N26cd09411c38776c9f715e24&lnm=309326&afid=WhaleShark+Media%2C+Inc.&ref=tgt_adv_xasd0002")
        		break;
        		case "KHOLS_COUPON":
        			sendShopButton(sender, "HARVEST30", "Kohl's", "http://www.kohls.com/?src=OOTtr9mlaCk&utm_campaign=449535&utm_medium=affiliate&utm_source=OOTtr9mlaCk&utm_content=8571&utm_term=3&siteID=OOTtr9mlaCk-vO6uJADV1OANA.ji9Qs8iQ")
        		break;
        		case "VICTORIAS_SECRET_COUPON":
        			sendShopButton(sender, "SAVINGS30", "Victoria's Secret", "https://www.victoriassecret.com/clothing?")
        		break;
        		case "EXPRESS_COUPON":
        			sendShopButton(sender, "1641", "Express", "http://www.express.com/")
        		break;
        		case "AMAZON_COUPON":
        			sendShopButton(sender, "", "Amazon", "https://www.amazon.com/gp/feature.html/?ie=UTF8&camp=1789&creative=390957&docId=1000805651&linkCode=ur2&tag=ret-20&ascsubtag=uuuF3E76956-C659-53B3-6E25-5113E5576049")
        		break;
        	}

        	continue;
        }
    }
    res.sendStatus(200)
})



const token = "EAAHcENr18boBAAHFIVprwgeiCUIaX67rZBObosOFLckLVlIn8U2CfVixIZA9QuKfOHnY9DvRwpOxZClZBV5ELQGDAIExyIAK5gQfnHEHYtZBWLG7ax28B6kiWiWS3ihZCx9v58QyZCVWJLZClKgJs8deFYPf9D9qfjZC7ZBFYpmpcGeQZDZD"


function sendShopButton(sender, code, brand, website) {

	let messageData = {}

	if (code == "") {
		let text = "No code needed"
		sendTextMessage(sender, text);

		let title = "Shop " + brand

		messageData = {

			"attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"button",
	        "text":"Start Shopping!",
	        "buttons":[
	          {
	            "type":"web_url",
	            "url":website,
	            "title": title
	          }
	        ]
	      }
	    }
		}
	} else {

		let text = "Paste this code at checkout: " 
		sendTextMessage(sender, text);

		let title = "Shop " + brand

		messageData = {
			"attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"button",
	        "text":code,
	        "buttons":[
	          {
	            "type":"web_url",
	            "url":website,
	            "title": title
	          }]}}}
	}


	request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function showDeals(sender) {

    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Get up to 60% off online",
                    "subtitle": "Aeropostal",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/aeropostale.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"AEROPOSTAL_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "$5 off your first order of $20+",
                    "subtitle": "Doordash",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/doordash.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"DOORDASH_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title":"$3.50 Sub Of The Day",
                    "subtitle":"Subway" ,
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/subway.com-coupons.jpg",
                    "buttons": [
                    {
                    	"type":"web_url",
                    	"title":"Store Locator",
    									"url":"http://www.subway.com/en-us/findastore",
                       "webview_height_ratio": "full"
                    },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "20% off any regularly priced item",
                    "subtitle": "Pacsun",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/pacsun.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"PACSUN_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title":  "$10 off $40 clothing",
                    "subtitle": "Target",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/target.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"TARGET_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "30% Off with Charge",
                    "subtitle":  "Kohl's",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/kohls.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"KHOLS_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "Extra 30% Off Lounge & Clearance",
                    "subtitle": "Victoria's Secret",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/victoriassecret.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"VICTORIAS_SECRET_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title":"$25 Off Every $100",
                    "subtitle": "Express",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/express.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"EXPRESS_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "BOGO Free Slurpee",
                    "subtitle": "7-Eleven",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/7-eleven.com-coupons.jpg",
                    "buttons": [{
                    	"type":"web_url",
                    	"title":"Store Locator",
    									"url":"https://www.7-eleven.com/locator",
                      "webview_height_ratio": "full"
                    },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "Up to 50% Off Electronics",
                    "subtitle": "Amazon",
                    "image_url": "https://o.rmncdn.com/thumbs/logos/l/amazon.com-coupons.jpg",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"AMAZON_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                }] 
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })

}