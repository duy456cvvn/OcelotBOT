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
		
	},
    test: function(test){
        test.cb('nowplaying', function(t){
            t.plan(2);
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("Now Playing") > -1 || data.message.indexOf("Nothing is Playing!") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["nowplaying"], "", bot));
        });
    }
};


