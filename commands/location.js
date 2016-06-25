 var gcm = require('node-gcm');
 exports.command = {
	name: "location",
	desc: "Stalk someone",
	usage: "location <person>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2){
			return false;
		}

		 var sender = new gcm.Sender(bot.config.gcm.senderID);

		if(!bot.config.gcm.people[args[1].toLowerCase()]){
			bot.sendMessage({
	            to: channel,
	            message: "Couldn't find a GCM client with that name"
        	});
        	return false;
		}

		var body = message.replace(args[0]+" "+args[1]+" ", ""); //sorry joel

		var pushMessage = new gcm.Message({"data": {	//how about fuck you neil
	      "method": "track"
	     }});
		
		sender.send(pushMessage, { registrationTokens: [bot.config.gcm.people[args[1].toLowerCase()]] }, function (err, response) {
		    if(err){
		    	bot.sendMessage({
		            to: channel,
		            message: err
		        });
		    }else{
	    		bot.sendMessage({
		            to: channel,
		            message: JSON.stringify(response)
		        });
		    }

		});
		sender = null;
       return true;
	}
};

// 1:24 PM Neil said: Auth key @Peter: AIzaSyD1WCjrhhXgL8wD-tiKuAbncLxDbgLsnR4
// 1:25 PM Neil said: Sender id: @Peter 457304965575