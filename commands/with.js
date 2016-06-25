exports.command = {
	name: "with",
	desc: "Perform a command in batch",
	usage: "with <command> (br) [args] (br) [args] (br)...",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2){
			return false;
		}
		var lines = message.split("\n");
		var command = lines[0].split(" ")[1];
		if (!bot.commands[command]) {
			 bot.sendMessage({
                to: channel,
                message: "Unknown command"
            });
		}else{
			for(var i in lines){
				if(i > 0){
	                try {
	                    if (!bot.commands[command].func(user, userID, channel, ("!"+command+" "+lines[i]).split(" "), ("!"+command+" "+lines[i]), bot)) {
	                        bot.sendMessage({
	                            to: channel,
	                            message: "**Invalid Usage:**\n!" + bot.commands[command].usage
	                        });
	                    }
	                } catch (e) {
	                    bot.sendMessage({to: channel, message: "Error performing command: " + e.toString()});
	                }
				}
				
			}
		}
			
        return true;
	}
};