/**
 * Created by Peter on 24/07/2017.
 */

const   request = require('request'),
        config = require('config');

module.exports = {
    name: "PUBG Stats",
    usage: "pubg <username> [solo/duo/squad]",
    accessLevel: 0,
    commands: ["pubg", "battlegrounds"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {

        if(!args[1]){
            recv.sendMessage({
                to: channel,
                message: `:bangbang: You must enter a PUBG username. Example: ${args[0]} unacceptableuse`
            });
        }else{
            request({
                url: `https://pubgtracker.com/api/profile/pc/${args[1]}`,
                headers: {
                    "TRN-Api-Key": config.get("Commands.pubg.key")
                }
            }, function(err, resp, body){
                if(err)bot.raven.captureException(err);
                try{
                    var data = JSON.parse(body);
                    if(data.error){
                        recv.sendMessage({
                            to: channel,
                            message: ":warning: That user does not exist or PUBG is down. Try a different user or try again later."
                        })
                    }else{
                        const section = args[2] ? args[2] : "solo";
                        const updated = new Date(data.LastUpdated);
                        var fields = [];
                        for(var i in data.Stats){
                            if(data.Stats[i].Match.toLowerCase() === section.toLowerCase()){
                                for(var j in data.Stats[i].Stats){
                                    var stat = data.Stats[i].Stats[j];
                                    fields.push({
                                        name: stat.label,
                                        value: `${stat.displayValue} (Top ${stat.percentile}%)`,
                                        inline: true
                                    });
                                }
                                break;
                            }
                        }
                        recv.sendMessage({
                            to: channel,
                            message: !args[2] ? `:information_source: Showing **solo** stats. Do ${args[0]} ${args[1]} duo or squad to get further details.` : `:information_source: Showing **${section}** stats.`,
                            color: 0xf7f733,
                            embed: {
                                title: `PUBG Stats for ${data.PlayerName}`,
                                description: `Last updated: ${updated.toLocaleDateString()} ${updated.toLocaleTimeString()}`,
                                thumbnail: {
                                    "url": data.Avatar
                                },
                                fields: fields
                            }
                        })
                    }
                }catch(e){
					bot.raven.captureException(e);
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: There was an error contacting the stats server. Try again later."
                    });
                    bot.error(e.stack);
                }

            })
        }
    }
};