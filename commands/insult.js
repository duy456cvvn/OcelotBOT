


exports.command = {
	name: "insult",
	desc: "Insult a user",
	usage: "insult <user>",
	func: function(user, userID, channel, args, message, bot){
		const insults = bot.config.insults;
		bot.sendMessage({
            to: channel,
            message: message.substring(8)+", "+insults[parseInt(Math.random() * insults.length)]
        });
        return true;
	},
	test: function(test){
		test.cb('Insult test', function(t){
			var bot = {};
			bot.sendMessage = function(data){
                t.true(data.message.indexOf("test") > -1);
				t.end();
			};

			t.true(exports.command.func(null, null, "", ["insult", "test"], "", bot));
		});
	}
};
