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
                    message: `*Country:* ${data.city ? data.city : "Unknown"}, ${data.region ? data.region : "Unknown"}, ${data.country ? data.country : "Unknown"} (${data.loc ? data.loc : "Unknown"})\n*Hostname:* ${data.hostname ? data.hostname : "Unknown"}\n*Organisation:* ${data.org ? data.org : "Unknown"}`
                });
            }catch(e){
                bot.sendMessage({
                    to: channel,
                    message: "Please enter a valid IP address"
                });
                bot.log(e+", "+body);
            }
        });

        return true;
    }
};