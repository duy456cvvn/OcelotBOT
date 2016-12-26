var request = require('request');

exports.command = {
	name: "nowplaying",
	desc: "Show whats currently playing",
	usage: "nowplaying",
	func: function(user, userID, channel, args, message, bot){
	    var target = args[1] ? args[1].replace("<@", "").replace(">", "") : userID;
        if(bot.config.petify.users[target]){
            request(`https://unacceptableuse.com/petify/api/${bot.config.petify.apiKey}/nowPlaying/${bot.config.petify.users[target]}`, function(err, resp, body){
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: err
                    });
                }else{
                    try {
                        var data = JSON.parse(body);
                        if (data.err) {
                            bot.sendMessage({
                                to: channel,
                                message: data.err
                            });
                        } else {
                            bot.sendMessage({
                                to: channel,
                                message: "Now Playing: *" + data.artist_name + " - " + data.title + "*"
                            });
                        }
                    }catch(e){
                        bot.sendMessage({
                            to: channel,
                            message: "Error: "+e
                        });
                        bot.log(body);
                    }
                }
            });
        }else{
            bot.sendMessage({
                to: channel,
                message: "You don't use Petify, so I don't give a shit what you're listening to. :peter_sad:"
            });
            bot.log("User ID:"+userID);
        }


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


