require('dotenv').config()
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const { Telegraf } = require('telegraf')
const { Client } = require("@googlemaps/google-maps-services-js")

const app = express()
app.use(bodyParser.json())

const client = new Client({})

const { TOKEN } = process.env
if (TOKEN === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}
const bot = new Telegraf(TOKEN)

bot.command('start', (ctx) => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to maps bot.\n============================================\n' +
        'This is telegram bot for maps bot.\n\n' +
        'Available commands: \n' +
        '/getPrice - check the price. \n' +
        '/goCheck - to check available gas station. \n' +
        '/nearBy - to check near by available gas station. \n'
        ,
        {}
    )
})

bot.command('goCheck', ctx => {
    client
        .textSearch({
            params: {
                query: 'petrol station in batticaloa',
                locations: [{ lat: 7.7240271, lng: 81.6628733 }],
                key: process.env.GOOGLE_MAPS_API_KEY,
                type: "gas_station",
                language: "en-GB",
                opennow: true
            },
            timeout: 1000, // milliseconds
        })
        .then((r) => {
            console.log('response', r.data.results)

            r.data.results.forEach(element => {
                ctx.replyWithMarkdown(`*${element.name}*. Petrol or Diesel is supplying right now | [View Location](https://www.google.com/maps/place/?q=place_id:${element.place_id}) | ${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`);
            });

        })
        .catch((e) => {
            console.log('error', e.response.data.error_message)
        });
})

bot.command('nearBy', ctx => {
    client
        .placesNearby({
            params: {
                locations: [{ lat: 7.7240271, lng: 81.6628733 }],
                keyword: 'gas_station',
                key: process.env.GOOGLE_MAPS_API_KEY,
                type: "gas_station",
                language: "en-GB",
                opennow: true,
                radius: 5000
            },
            timeout: 1000, // milliseconds
        })
        .then((r) => {
            console.log('response', r.data.results)

            const formatted_address = [];

            r.data.results.forEach(element => {
                formatted_address.push(element.name);
                // bot.telegram.sendMessage(ctx.chat.id, `https://www.google.com/maps/search/?api=1&query=${element.name}`);
            });
            bot.telegram.sendMessage(ctx.chat.id, formatted_address.join('\r\n'));
        })
        .catch((e) => {
            console.log('error', e.response.data)
        });
})

bot.command('getPrice', ctx => {
    ctx.replyWithMarkdown('__Price Chart__ \n============================================\n\n' +

    '*ceypetco*'.toUpperCase() + '\n' +
    'Lanka Petrol 92 Octane - *Rs. 338.00* \n' +
    'Lanka Petrol 95 Octane Euro 4 - *Rs. 373.00* \n' +
    'Lanka Auto Diesel - *Rs. 289.00* \n' +
    'Lanka Super Diesel 4 Star Euro 4 - *Rs. 329.00* \n' +
    'Lanka Kerosene - *Rs. 87.00* \n' + 
    'Lanka Industrial Kerosene - *Rs. 160.00* \n' + 
    'Checkout for more details - [Click here](https://ceypetco.gov.lk/marketing-sales/) \n' +

    '\n' +

    '*Lanka IOC*' + '\n' +
    'Petrol 92 Octane - *Rs. 338.00* \n' +
    'Petrol 95 Octane Euro 4 - *Rs. 367.00* \n' +
    'Petrol Euro 3 - *Rs. 347.00* \n' +
    'Auto Diesel - *Rs. 289.00* \n' +
    'Super Diesel 4 Star Euro 4 - *Rs. 327.00* \n' +
    'Checkout for more details - [Click here](https://www.lankaioc.com/price-list/) \n'
    );
})

bot.launch()

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
})