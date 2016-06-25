var whois = require('node-whois');
exports.command = {
	name: "whois",
	desc: "WHOIS lookup a domain",
	usage: "whois <domain>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2){
			return false;
		}

		whois.lookup(args[1], function(err, data){
			if(err){
				bot.sendMessage({
		            to: channel,
		            message: "An error occurred: "+err
		        });
			}else{
				bot.sendMessage({
		            to: channel,
		            message: "```\n"+data+ "....\n```"
		        });
			}
		});

		
        return true;
	}
};