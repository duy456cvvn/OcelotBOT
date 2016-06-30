exports.command = {
	name: "test",
	desc: "A test command",
	usage: "test",
    onReady: function(bot){
        bot.registerInteractiveMessage("test", function(name, val, info){
            bot.sendMessage({
                to: channel,
                message: `:whey: Receieved callback response: \`${name}\`=\`${val}\``
            });
            return "";
        });

    },
	func: function(user, userID, channel, args, message, bot){
        bot.sendButtons(channel, "Test buttons", "test buttons", "test", "#fefefe", [{"name": "a", "text": "Test", "value": "dick"}]);
		return true;
	}
};

