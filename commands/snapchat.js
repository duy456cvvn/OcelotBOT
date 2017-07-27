/**
 * Created by Peter on 02/07/2017.
 */

const request = require('request');
const svg2png = require('svg2png');
module.exports = {
    name: "Snapcode Generator",
    usage: "snapchat <username>",
    accessLevel: 0,
    commands: ["snapchat", "snapcode"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(!args[1]){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter a snapchat username. i.e !snapchat unacceptableuse"
            });
        }else{
            recv.simulateTyping(channel);
            request(`https://snapcodes.herokuapp.com/snapcode.php?username=${args[1]}&size=400`, function(err, resp, body){
                if(!err){
                    svg2png(new Buffer(body), {width: 400, height: 400})
                        .then(function(image){
                            recv.uploadFile({
                                to: channel,
                                file: image,
                                filename: "snapcode.png",
                                message: "Here's your snapcode:"
                            });
                        })
                        .catch(function(err){
                            recv.sendMessage({
                                to: channel,
                                message: ":bangbang: An error occurred. Please try again later."
                            });
                            bot.error(err.stack);
                        })
                }else{
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: An error occurred. Please try again later."
                    });
                    bot.error(err.stack);
                }
            });
        }

    }
};