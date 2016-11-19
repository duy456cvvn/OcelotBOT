/**
 * Created by Peter on 19/11/2016.
 */
var request = require('request');
exports.command = {
    name: "ipinfo",
    desc: "Get IP information",
    usage: "ipinfo <ip>",
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2){
            return false;
        }
        request("http://ipinfo.io/"+args[1]+"/json", function(err, response, body){
            try{
                var data = JSON.parse(body);
                bot.sendMessage({
                    to: channel,
                    message: `*Country:* ${data.city}, ${data.region}, ${data.country} (${data.loc})\n*Hostname:* ${data.hostname}\n*Organisation:* ${data.org}`
                });
            }catch(e){
                bot.sendMessage({
                    to: channel,
                    message: "Error: "+e+"\n"+body
                });
            }
        });

        return true;
    }
};