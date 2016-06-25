var markov = require('markov');
exports.command = {
	name: "markov",
	desc: "Generate a markov chain based on a user",
	usage: "markov <user>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;
		bot.getMessages({
			channel: channel,
			limit: 500
		}, function(err, messages){
			if(err){
				bot.sendMessage({
		            to: channel,
		            message: "Error: "+err
		        });
			}else{
				var m = markov(3);
				var parsedMessages = "";
				for(i in messages){
					var message = messages[i];
					if(message.author.username === args[1]){
						parsedMessages += " "+message.content;
					}
				}
				if(parsedMessages.length < 5){
					bot.sendMessage({
			            to: channel,
			            message: "Insufficient data for meaningful answer."
			        });
				}else{
					m.seed(parsedMessages, function(){
						bot.sendMessage({
				            to: channel,
				            message: m.fill(m.pick(), (Math.random()*100)+1).join(" ")
				        });
						m = null;
					});
				}
				
			}
		});


        return true;
	}
};