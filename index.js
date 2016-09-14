'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
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
            sendTextMessage(sender, "www.google.com")
        }
    }
    res.sendStatus(200)
})

const token = "EAAHcENr18boBAA7t7PlsvJqA5Fd01ZCSI57Sn5ZA29qX59SyWTctpWVvwce6NHZCoVczQq1qse1ggyG4xK2KbmcaMNZAepF8clnu6g0dXjxy0NhQeHMZBCau6pCK4fuJCiq6L4fM2iRHMiOwuPlHXbawKZAfl0hO4ZB7ffN4dBDrwZDZD"


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
                    "title": "Payless Shoes",
                    "subtitle": "15% Off Regular Price Purchases",
                    "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Payless_ShoeSource_Logo.svg/1280px-Payless_ShoeSource_Logo.svg.png",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"PAYLESS_COUPON"
			              },
			              {
			              	"type":"element_share"
			              }],
                },{
                    "title": "Footlocker",
                    "subtitle": "15% Off $70+ Online",
                    "image_url": "http://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/082012/foot_locker_primary_logo_-_no_url_cmyk.png?itok=hIb7I0Xr",
                    "buttons": [{
			                "type":"postback",
			                "title":"Show Code",
			                "payload":"FOOT_LOCKER_COUPON"
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