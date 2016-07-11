var request = require('request');
exports.command = {
	name: "nowplaying",
	desc: "Show whats currently playing",
	usage: "nowplaying",
	func: function(user, userID, channel, args, message, bot){

		request("https://unacceptableuse.com/petermon/music/nowplaying", function(err, resp, body){
            if(err){
                bot.sendMessage({
                	to: channel,
                	message: err
                });
            }else{
                var data = JSON.parse(body);
                if(data.title){
                    bot.sendMessage({
                        to: channel,
                        message: "*Now Playing*: "+data.artist+" - "+data.title
                    })
                }else{
                    bot.sendMessage({
                    	to: channel,
                    	message: "Nothing is playing! Music is here: https://unacceptableuse.com/petermon/music"
                    });
                }
            }
        });

		return true;
		
	}
};


