var	http = require('http');
exports.command = {
	name: "defineud",
	desc: "Get an urban dictionary definition",
	usage: "defineud <word>",
	func: function(user, userID, channel, args, message, bot){
		var term = encodeURIComponent(args.slice(1).join(" "));
		http.get("http://api.urbandictionary.com/v0/define?term="+term, function (response) {
	        var body = "";
	        response.on('data', function (chunk) {
	            body += chunk;
	        });

	        response.on('end', function () {
				try {
					var data = JSON.parse(body);
                    if(data && data.list.length > 0){
                        var randEntry = data.list[parseInt(Math.random() * data.list.length)];
                        bot.sendMessage({
                            to: channel,
                            message: "\n" + randEntry.definition + "\n```" + randEntry.example + "```"
                        });
                    }else{
                        bot.sendMessage({
                        	to: channel,
                        	message: "No definitions found."
                        });
                    }
				}catch(e){
					bot.sendMessage({
						to: channel,
						message: "Recieved bad response from server: "+e
					});
				}
	           	
	        });
    	});

        return true;
	}
};