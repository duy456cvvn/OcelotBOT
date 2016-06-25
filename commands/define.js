//FIXME Find working disctionary
var Dictionary = require('mw-dictionary');
exports.command = {
	name: "define",
	desc: "Define something",
	usage: "define",
	func: function(user, userID, channel, args, message, bot){
		var dict = new Dictionary(bot.config.dictionary);
		if(args.length < 2){
			return false;
		}
		dict.define(args[1], function(err, result){
			if(err){
				bot.sendMessage({
		            to: channel,
		            message: "Couldn't find that word. "+ (err === "suggestions" ? "Suggestions: "+result.join(",") : "")
		        });
			}else{
				bot.sendMessage({
		            to: channel,
		            message: "**"+args[1]+"**:\n"+result[0].definition
		        });
			}
		});
		
        return true;
	}
};