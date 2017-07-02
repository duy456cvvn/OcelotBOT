/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const orientations = [
    "straight",
    "gay",
    "tranny"
];
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest [country]",
    accessLevel: 0,
    commands: ["pornsuggest"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args[1] && args[1].length > 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: Countries must be country codes. i.e !pornsuggest gb"
            });
        }else{
            request(`https://www.pornmd.com/getliveterms?country=${args[1] ? args[1] : ""}&orientation=${bot.util.arrayRand(orientations)}`, function(err, resp, body){
                if(err){
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Error contacting pornsuggest service. Try again later."
                    });
                    bot.error(err.stack);
                }else{
                    try{
                        const names = JSON.parse(body);
                        bot.sendMessage({
                            to: channel,
                            message: `Feeling horny? Try *${bot.util.arrayRand(names).keyword}*`
                        });
                    }catch(e){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: Error parsing pornsuggest service response. Try again later."
                        });
                        bot.error(e.stack);
                    }
                }
            });
        }
    }
};