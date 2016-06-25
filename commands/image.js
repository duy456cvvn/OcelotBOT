var http = require('http');
exports.command = {
	name: "image",
	desc: "Pull a random image from a subreddit",
	usage: "image <subreddit>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2){
			return false;
		}

		var options = {
		  host: 'api.reddit.com',
		  path: '/r/'+args[1],
		  headers: {
		  	"user-agent": "OcelotBOT link parser by /u/UnacceptableUse"
		  }
		};

	    http.get(options, function (response) {
	        var body = "";
	        response.on('data', function (chunk) {
	            body += chunk;
	        });

	        response.on('end', function () {
	            var data = JSON.parse(body);
	            if(data.error){
	            	var message = "";
	            	switch(data.error){
	            		case 404:
	            			message = "Subreddit does not exist or was banned";
	            			break;
            			case 403:
            				message = "Subreddit is invite only or quarantined.";
            				break;
            			default:
            				message = "Unknown error ("+data.error+")";
            				break;

	            	}

	            	bot.sendMessage({
			            to: channel,
			            message: message
			        });
	            }else{
	            	var data = data.data;
	            	if(data.children.length === 0){
	            		bot.sendMessage({
				            to: channel,
				            message: "There doesn't seem to be anything there."
			        	});
	            	}else{
	            		var posts = data.children;
	            		var randPost;

	            		for(var i = 0; i < 50; i++){
	            			var randPost = posts[parseInt(Math.random() * posts.length)];
            				if(randPost.data.selftext_html === null &&
								(randPost.data.url.indexOf("imgur.com") > -1 ||
                                randPost.data.url.indexOf("i.redd.it") > -1 ||
                                randPost.data.url.indexOf(".png") > -1 ||
                                randPost.data.url.indexOf(".jp") > -1)){
            					break;
            				}
	            		}

    					bot.sendMessage({
				            to: channel,
				            message: i === 50 ? "Couldn't find a post" : randPost.data.title +" - " +randPost.data.url
			        	});
	            		
	            		

	            	}
	            }
	        });
    	});
        return true;
	}
};