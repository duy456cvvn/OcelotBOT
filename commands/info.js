exports.command = {
	name: "info",
	desc: "Get info on stuff",
	usage: "info [bot/server/channel]",
	func: function(user, userID, channel, args, inmessage, bot){
		if(args.length < 2)return false;

		var message = "\n";

		if(args[1] == "bot"){
			message += "*BOT INFO:*\n";
			message += "`name`: "+process.title+"\n";
			message += "`platform`: "+process.platform+"\n";
			message += "`env`: "+process.env.path+"\n";
			message += "`pid`: "+process.pid+"\n";
			message += "`uptime`: "+process.uptime()/60+" minutes \n";
			message += "`dependancies`: "+JSON.stringify(Object.keys(process.versions))+"\n";
			message += "**Servers:**\n";
			for(var serverID in bot.servers){
				var server = bot.servers[serverID];
				message += "`"+serverID+"`: "+server.name+"\n";
	   	 	}
		}else if(args[1] == "server"){
			var serverID = bot.serverFromChannel(channel);
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
	}
};

	   