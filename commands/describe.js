/**
 * Created by Peter on 02/06/2017.
 */
var captionbot = require('captionbot');
exports.command = {
    name: "describe",
    desc: "Describes an image for you",
    usage: "describe <url>",
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2){
            return false;
        }
        captionbot(args[1], function(caption){
           bot.sendMessage({
               to: channel,
               message: caption
           }) ;
        });


        return true;
    }
};