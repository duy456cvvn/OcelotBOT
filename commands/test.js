exports.command = {
	name: "test",
	desc: "A test command",
	usage: "test",
	func: function(user, userID, channel, args, message, bot){

        bot.sendMessage({
        	to: channel,
        	message: "What in gods name is going on here"
        });

		bot.registerInteractiveMessage("test", function(name, val){
            bot.sendMessage({
            	to: channel,
            	message: `:whey: Receieved callback response: \`${name}\`=\`${val}\``
            });
			return "";
		});

        bot.sendButtons(channel, "Test buttons", "a", "test", "#fefefe    ", [{"name": "a", "text": "Test", "value": "dick"}]);
		return true;
	}
};

