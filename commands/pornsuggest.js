var http = require('http');
exports.command = {
	name: "pornsuggest",
	desc: "Suggest some porn",
	usage: "pornsuggest",
	func: function(user, userID, channel, args, message, bot){
		http.get("http://www.pornmd.com/getliveterms?orientation=s", function(response){
			var body = "";
	        response.on('data', function (chunk) {
	            body += chunk;
	        });
	        response.on('end', function () {
	          	var names = JSON.parse(body);
	          	console.log(names[parseInt(Math.random() * names.length)].keyword);
	          	bot.sendMessage({
	            	to: channel,
	            	message: "Feeling horny? Try *"+(names[parseInt(Math.random() * names.length)].keyword)+"*"
    			});
	      	});
			
		});

        return true;
	}
};