/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
module.exports = {
    name: "Number Fact",
    usage: "numberfact <number>",
    accessLevel: 0,
    commands: ["numberfact"],
    run: async function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "NUMBERFACT_USAGE")
            });
        }else{
            request(`http://numbersapi.com/${parseInt(args[1])}/`, function(err, resp, body){
                recv.sendMessage({
                    to: channel,
                    message: err || body
                });
            });
        }
    }
};