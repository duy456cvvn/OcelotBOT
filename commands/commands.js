exports.command = {
	name: "commands",
	desc: "This command",
	usage: "commands",
	func: function(user, userID, channel, args, message, bot){
		var msg = "";

		for(var i in bot.commands){
			var command = bot.commands[i];
			msg += "\n*!"+command.name+"* - "+command.desc+" `!"+command.usage+"`";
		}

		bot.sendMessage({
            to: channel,
            message: msg
        });
        return true;
	}
};