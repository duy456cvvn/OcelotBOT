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
	          	var data = JSON.parse(body);
	            bot.sendMessage({
		            to: channel,
		            message: "\n"+data.list[0].definition+"\n```"+data.list[0].example+"```"
		        });
	           	
	        });
    	});

        return true;
	}
};