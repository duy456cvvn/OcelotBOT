/**
 * Created by Peter on 01/07/2017.
 */

const request = require('request');
module.exports = {
    name: "Urban Dictionary",
    usage: "defineud <word>",
    accessLevel: 0,
    commands: ["defineud", "ud"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        const term = encodeURIComponent(args.slice(1).join(" "));
        request(`http://api.urbandictionary.com/v0/define?term=${term}`, function(err, resp, body){
            if(err){
                bot.error(err.stack);
                recv.sendMessage({
                    to: channel,
                    message: ":bangbang: Unable to reach Urban Dictionary right now. Try again later."
                });
            }else{
                try{
                    const data = JSON.parse(body);
                    if(data && data.list.length > 0){
                        const randEntry = bot.util.arrayRand(data.list);
                        recv.sendMessage({
                            to: channel,
                            message: `Definition for **${randEntry.word}:**\n${randEntry.definition}\n\`\`\`${randEntry.example}\`\`\``
                        });
                    }else{
                        recv.sendMessage({
                            to: channel,
                            message: ":warning: No definitions found."
                        });
                    }
                }catch(e){
                    bot.error(e.stack);
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Got invalid response from Urban Dictionary. Try again later."
                    });
                }
            }
        });

    }
};