/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
module.exports = {
    name: "Currency Converter",
    usage: "currency <currency> <currency>",
    accessLevel: 0,
    commands: ["currency"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 3){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter two currencies i.e USD GBP"
            });
        }else{
            const first = args[1].toUpperCase();
            const second = args[2].toUpperCase();
            recv.simulateTyping(channel);
            request(`https://api.fixer.io/latest?symbols=${second}&base=${first}`, function currencyConverterCB(err, resp, body){
                if(err){
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Could not contact conversion API. Try again later."
                    });
                    bot.error(err);
                }else{
                    try{
                        const data = JSON.parse(body);
                        if(data.base && data.rates[second]){
                            recv.sendMessage({
                                to: channel,
                                message: `:dollar: 1 ${data.base} = ${data.rates[second]} ${second}`
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: ":bangbang: Invalid currencies. You must enter currency codes i.e EUR or GBP."
                            });
                        }
                    }catch(e){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: Received invalid response from conversion API. Try again later."
                        });
                        bot.error(e);
                        bot.error(body);
                    }
                }
            })
        }

    }
};