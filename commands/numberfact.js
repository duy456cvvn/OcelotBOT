/**
 * Created by Peter on 01/06/2017.
 */
var request = require('request');
exports.command = {
    name: "numberfact",
    desc: "Gives you an exciting fact about a number",
    usage: "numberfact <number>",
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2){
            return false;
        }
        request("http://numbersapi.com/"+args[1]+"/", function(err, resp, body){
           bot.sendMessage({
               to: channel,
               message: err || body
           })
        });
        
        return true;
    }
};