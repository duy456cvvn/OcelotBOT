var markov = require('markov');
var async = require('async');

exports.command = {
	name: "markov",
	desc: "Generate a markov chain based on a user",
	usage: "markov <user> [sample] [length] [key]",
	func: function(user, userID, channel, args, message, bot) {
		if(args.length < 2) {
            return false;
        }

        var messageID = 0;
        bot.sendMessage({
        	to: channel,
        	message: "Generating Markov Chain (This might take a while)"
        }, function(err, resp){
            if(!err) {
                messageID = resp.ts;
            }
        });

        var sample = args[3] && !isNaN(args[3]) ? parseInt(args[3]) : bot.config.markov.defaultSample;
        var length = args[2] && !isNaN(args[3]) ? parseInt(args[2]) : bot.config.markov.defaultLength;

        bot.connection.query('SELECT message FROM Messages WHERE user = ? LIMIT ?', [args[1], sample], function(err, result) {
            if(err) {
                bot.editMessage({
                    channel: channel, 
                    messageID: messageID,
                    message: `Error: ${err}`
                });
            } else {
                bot.log('Retrieved messages');

                var m = markov(),
                    count = 0;
                
                async.eachSeries(result, function(row, cb) {
                    m.seed(row.message, function() {
                        count++;
                        bot.editMessage({
                            channel: channel,
                            messageID: messageID,
                            message: `Generating Markov Chain (Seeded ${Math.floor((count / sample) * 100)}%)`
                        }, cb);
                    });
                }, function() {
                    var messages = [
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                        m.forward(args[4] ? args[4] : m.pick(), length).join(" "),
                    ];

                    bot.editMessage({
                        channel: channel,
                        messageID: messageID,
                        message: `>${messages.join('\n>')}`
                    });
                });
            }
        });

        return true;
	}
};