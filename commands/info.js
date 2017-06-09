exports.command = {
	name: "info",
	desc: "Get info on stuff",
	usage: "info [bot/server/channel]",
	func: function(user, userID, channel, args, inmessage, bot){
		if(args.length < 2)return false;

		var message = "\n";

		if(args[1] === "bot"){
			message += "*BOT INFO:*\n";
            message += "**Created By**: <@139871249567318017> (Big P#1843)\n";
			message += "`name`: "+process.title+"\n";
			message += "`platform`: "+process.platform+"\n";
			message += "`pid`: "+process.pid+"\n";
			message += "`uptime`: "+parseInt(process.uptime()/60)+" minutes \n";
			message += "`users`: " + Object.keys(bot.users).length+"\n";
            message += "`channels`: " + Object.keys(bot.channels).length+"\n";
			if(userID == "139871249567318017" && args[3]){
                message += "**Servers:**\n";
                for(var serverID in bot.servers){
                    var server = bot.servers[serverID];
                    message += "`"+serverID+"`: "+server.name+"\n";
                }
            }else{
                message += "`servers`: " + Object.keys(bot.servers).length+"\n";
            }

		}else if(args[1] === "server"){
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

	   