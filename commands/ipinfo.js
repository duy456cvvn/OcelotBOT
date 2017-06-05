/**
 * Created by Peter on 19/11/2016.
 */
var request = require('request');


var reportCategories = {
    3: "Fraud Orders",
    4: "DDoS Attack",
    9: "Open Proxy",
    10: "Web Spam",
    11: "Email Spam",
    14: "Port Scan",
    18: "Brute Force",
    19: "Bad Web Bot",
    20: "Exploited Host",
    21: "Web App Attack",
    22: "SSH",
    23: "IoT Targeted"
};

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

        request(`https://www.abuseipdb.com/check/${args[1]}/json?key=${bot.config.misc.abuseIPDBKey}&days=365`, function(err, resp, body){
            try{
                var data = JSON.parse(body);
                if(data.length > 0){
                    var lastReportData = data[0];
                    var lastReport = lastReportData.created+" ";
                    for(var i in lastReportData.category){
                        lastReport += reportCategories[lastReportData.category[i]];
                    }
                    bot.sendMessage({
                        to: channel,
                        message: `*IP Address was reported to AbuseIPDB ${data.length} times in the past year.*\nLast Report:\n\`\`\`\n${lastReport}\n\`\`\``
                    });
                }

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