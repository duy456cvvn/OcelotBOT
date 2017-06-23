exports.command = {
	name: "info",
	desc: "Get info on stuff",
	usage: "info [bot/server/channel]",
	func: function(user, userID, channel, args, inmessage, bot){
		if(args.length < 2)return false;

		var arg = args[1].toLowerCase();

		if(arg === "bot") {

            bot.sendAttachment(channel, "", [{
                fallback: "...",
                color: "#9e9e9e",
                title: `**OcelotBOT v3 created by Big P#1843**`,
                text: "Support Server: https://discord.gg/7YNHpfF",
                fields: [
                    {
                        title: "Uptime",
                        value: parseInt(process.uptime() / 60) + " minutes.",
                        short: true
                    },
                    {
                        title: "Users",
                        value: Object.keys(bot.users).length + "",
                        short: true
                    },
                    {
                        title: "Servers",
                        value: Object.keys(bot.servers).length + "",
                        short: true
                    },
                    {
                        title: "Channels",
                        value: Object.keys(bot.channels).length + "",
                        short: true
                    }
                ]
            }]);
        }else if(arg === "spell"){
            bot.sendAttachment(channel, "", [{
                fallback: "...",
                color: "#9e9e9e",
                title: `**Spell command response times**`,
                text: "",
                fields: [
                    {
                        title: "Total Letters",
                        value: bot.spellQueueTotal+"",
                        short: true
                    },
                    {
                        title: "Average Response Time",
                        value:  (bot.spellQueueTotalTime/bot.spellQueueTotal).toFixed(2)+" ms",
                        short: true
                    },
                    {
                        title: "Total Retries",
                        value: bot.spellQueueTotalRetries + "",
                        short: true
                    },
                    {
                        title: "Total Failed",
                        value: bot.spellQueueTotalFailed + "",
                        short: true
                    }
                ]
            }]);
        }else if(args[1] === "server"){
		    var message = "";
			var serverID = bot.channels[channel].guild_id;
			var server = bot.servers[serverID];
			message += "*SERVER INFO:*\n";
			message += "`name`: "+server.name+"\n";
			message += "`large`: "+server.large+"\n";
			message += "`region`: "+server.region+"\n";
			message += "`joined_at`: "+server.joined_at+"\n";
			message += "`members`: "+Object.keys(server.members).length+"\n";
			message += "`roles`: "+Object.keys(server.roles).length+"\n";
			message += "`channel`: "+channel+"\n";
			// var channelList = "test\n";
			// for(var channelID in server.channels){
			// 	var channel = server.channels[channelID];
			// 	channelList += "`"+channelID+"`: "+channel.name+" ("+channel.type+")\n";

			// }
			// console.log(channelList);
			// setTimeout(function(){
			// 	bot.sendMessage({
		 //            to: channel,
		 //            message: channelList
   //      		});
			// }, 500);

		}

        bot.sendMessage({
            to: channel,
            message: message
        });

        return true;
	},
	test: function(test){
        test('Info with no arguments', function(t){
            t.false(exports.command.func(null, null, "", ["info"], "", null));
        });


        test.cb.failing('Info for bot', function(t){
            t.plan(2);
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("uptime") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["info", "bot"], "", bot));
        });
	}
};

	   