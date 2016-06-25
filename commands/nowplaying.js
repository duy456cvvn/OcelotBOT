var http = require('http');
exports.command = {
	name: "nowplaying",
	desc: "Show whats currently playing",
	usage: "nowplaying",
	func: function(user, userID, channel, args, message, bot){
		 bot.sendMessage({
    		to: channel,
    		message: "**Now Playing:** "+bot.nowPlaying
		});
		return true;
		
	}
};


