/**
 * Created by Peter on 01/07/2017.
 */
const config = require('config');
const request = require('request');
const reportCategories = config.get("Commands.ipinfo.reportCategories");
module.exports = {
    name: "IP Info",
    usage: "ipinfo <ip>",
    accessLevel: 0,
    commands: ["ipinfo"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter an IP address."
            });
        }else{
            request(`http://ipinfo.io/${args[1]}/json`, function(err, response, body){
                try{
                    var data = JSON.parse(body);
                    recv.sendMessage({
                        to: channel,
                        message: `*Country:* ${data.city ? data.city : "Unknown"}, ${data.region ? data.region : "Unknown"}, ${data.country ? data.country : "Unknown"} (${data.loc ? data.loc : "Unknown"})\n*Hostname:* ${data.hostname ? data.hostname : "Unknown"}\n*Organisation:* ${data.org ? data.org : "Unknown"}`
                    });
                }catch(e){
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Please enter a valid IP address"
                    });
                    bot.error(`${e.stack}, ${body}`);
                }
            });
            request(`https://www.abuseipdb.com/check/${args[1]}/json?key=${config.get("Commands.ipinfo.key")}&days=${config.get("Commands.ipinfo.days")}`, function(err, resp, body){
                try{
                    var data = JSON.parse(body);
                    if(data.length > 0){
                        var lastReportData = data[0];
                        var lastReport = lastReportData.created+" ";
                        for(var i in lastReportData.category){
                            lastReport += reportCategories[lastReportData.category[i]];
                        }
                        recv.sendMessage({
                            to: channel,
                            message: `:warning: **IP Address was reported to AbuseIPDB __${data.length} times__ in the past year.**\nLast Report:\n\`\`\`\n${lastReport}\n\`\`\``
                        });
                    }

                }catch(e){
                    bot.log(`${e.stack}, ${body}`);
                }
            });
        }

    }
};