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
			    data = data.replace(/%.*$/mgi, "");
				if(bot.isDiscord){
                    bot.sendMessage({
                        to: channel,
                        message: "",
                        embed: {
                            color: 16646398,
                            title: "",
                            description: data.length > 2000 ? data.substring(0, 2000)+"..." : data,
                            author: {
                                name: "Whois data for "+args[1],
                            }
                        }
                    }, function(err){
                        if(err){
                            bot.sendMessage({
                                to: channel,
                                message: JSON.stringify(err)
                            });
                        }
                    });
				}else{
                    bot.sendMessage({
                        to: channel,
                        message: "```\n"+data+ "....\n```"
                    });
				}

			}
		});

		
        return true;
	},
	test: function(test){
		test('whois no arguments', function(t){
			t.false(exports.command.func(null, null, "", ["whois"], "", null));
		});

	}
};