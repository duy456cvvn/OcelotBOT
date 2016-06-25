exports.command = {
	name: "test",
	desc: "A test command",
	usage: "test",
	func: function(user, userID, channel, args, message, bot){
        bot.sendButtons(channel, "Test buttons", "a", "a", "#fefefe    ", [{"name": "a", "text": "Test", "value": "dick"}]);
		return true;
	}
};

