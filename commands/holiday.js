/**
 * Created by Peter on 08/06/2017.
 */
const request = require('request');
exports.command = {
    name: "holiday",
    desc: "What holiday is it today?",
    usage: "holiday [country]",
    func: function(user, userID, channel, args, message, bot){
        var today = new Date();
        request.get(`https://holidayapi.com/v1/holidays?key=${bot.config.misc.holidayApiKey}&country=${args[1] ? args[1] : "GB"}&year=2016&month=${today.getMonth()}&day=${today.getDay()}`, function(err, resp, body){
            try{
                var data = JSON.parse(body);
                if(data.holidays && data.holidays.length > 0){
                    bot.sendMessage({
                        to: channel,
                        message: `Today is **${data.holidays[0].name}**!`
                    });
                }else{
                    bot.sendMessage({
                        to: channel,
                        message: "No holidays today... get back to work!"
                    });
                }

            }catch(e){
                bot.sendMessage({
                    to: channel,
                    message: `Error: ${err}`
                });
            }

        });

        return true;
    }
};