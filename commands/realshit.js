/**
 * Created by Peter on 08/06/2017.
 */
const request = require('request');
const faced = require('faced');
exports.command = {
    name: "realshit",
    desc: "Give someone laser eyes",
    usage: "realshit [url]",
    func: function(user, userID, channel, args, message, bot){

        if(bot.isDiscord)return true;
        var doRealShit = function(url){

        };

        if(!args[1]){
            bot.getMessages({
                channelID: channel,
                limit: 2
            }, function(err, resp){
                if(resp[1].embed.url)
                doRealShit(resp[1].embed.image.url);
            });
        }


        return true;
    }
};