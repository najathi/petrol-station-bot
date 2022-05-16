require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { Telegraf } = require('telegraf')
const { Client } = require("@googlemaps/google-maps-services-js")

const { district, formatted_district } = require('./data/district.js')

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
        '/goCheckBatticaloa (Batticaloa) - to check available gas station in batticaloa. \n' +

        '\n' +

        '/exit - Exit the system. \n'
        ,
        {}
    )
})

const listHandler = (ctx) => {
    setTimeout(() => {
        bot.telegram.sendMessage(ctx.chat.id, 'Available commands: \n' +
            '/getPrice - check the price. \n' +
            '/goCheck - to check available gas station. \n' +
            '/goCheckBatticaloa (Batticaloa) - to check available gas station in batticaloa. \n' +

            '\n' +

            '/exit - Exit the system. \n'
            ,
            {}
        )
    }, 6000);
}

bot.command('list', (ctx) => {
    listHandler(ctx);
})

const getLocation = (ctx, district) => {
    client
        .textSearch({
            params: {
                query: 'petrol station in ' + district,
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
}

bot.command('goCheck', ctx => {
    bot.telegram.sendMessage(ctx.chat.id, 'Can we get your district name?', {
        "reply_markup": {
            "one_time_keyboard": true,
            "resize_keyboard": true,
            "keyboard": [
                ...formatted_district,
                ["Cancel"],
            ]
        }
    });
})

district.forEach(element => {
    bot.hears(element, (ctx) => {
        getLocation(ctx, element);
        listHandler(ctx);
    })
})

bot.command('goCheckBatticaloa', ctx => {
    getLocation(ctx, "batticaloa");
    listHandler(ctx);
})

bot.command('getPrice', ctx => {

    bot.telegram.sendMessage(ctx.chat.id, "great, please select your favorite Fuel Filling Station", {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "CEYPETCO",
                    callback_data: 'ceypetco'
                },
                {
                    text: "Lanka IOC",
                    callback_data: 'lankaioc'
                }
                ],

            ]
        }
    })
})

bot.action('ceypetco', ctx => {
    ctx.replyWithMarkdown('__Price Chart__ \n============================================\n\n' +

        '*ceypetco*'.toUpperCase() + '\n' +
        'Lanka Petrol 92 Octane - *Rs. 338.00* \n' +
        'Lanka Petrol 95 Octane Euro 4 - *Rs. 373.00* \n' +
        'Lanka Auto Diesel - *Rs. 289.00* \n' +
        'Lanka Super Diesel 4 Star Euro 4 - *Rs. 329.00* \n' +
        'Lanka Kerosene - *Rs. 87.00* \n' +
        'Lanka Industrial Kerosene - *Rs. 160.00* \n' +
        'Checkout for more details - [Click here](https://ceypetco.gov.lk/marketing-sales/) \n'

    )
    listHandler(ctx);
})

bot.action('lankaioc', ctx => {
    ctx.replyWithMarkdown('__Price Chart__ \n============================================\n\n' +

        '*Lanka IOC*' + '\n' +
        'Petrol 92 Octane - *Rs. 338.00* \n' +
        'Petrol 95 Octane Euro 4 - *Rs. 367.00* \n' +
        'Petrol Euro 3 - *Rs. 347.00* \n' +
        'Auto Diesel - *Rs. 289.00* \n' +
        'Super Diesel 4 Star Euro 4 - *Rs. 327.00* \n' +
        'Checkout for more details - [Click here](https://www.lankaioc.com/price-list/) \n'

    )
    listHandler(ctx);
})

bot.hears(['bye', 'exit', 'stop', 'quit'], (ctx) => {
    exitHandler(ctx);
})

bot.command('exit', (ctx) => {
    exitHandler(ctx);
})

const exitHandler = ctx => {
    bot.telegram.sendMessage(ctx.chat.id, `Next time, when using this service. let's say \n/start\n\nThank you for using our services \n`)
    bot.telegram.sendPhoto(ctx.chat.id, "https://images.pexels.com/photos/3826674/pexels-photo-3826674.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")
    ctx.leaveChat()
}

bot.launch()

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
})