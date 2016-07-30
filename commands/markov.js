var markov = require('markov');
var r = require("rethinkdb");
var async = require('async');
exports.command = {
	name: "markov",
	desc: "Generate a markov chain based on a user",
	usage: "markov <user> [sample] [length] [key]",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;

        var messageID = 0;
        bot.sendMessage({
        	to: channel,
        	message: "Generating Markov Chain (This might take a while)"
        }, function(err, resp){
            if(!err)
                messageID = resp.ts;
        });

        var sample = args[3] && !isNaN(args[3]) ? parseInt(args[3]) : 100;
        var length = args[2] && !isNaN(args[3]) ? parseInt(args[2]) : 35;

        r.db("ocelotbot").table("messages").filter({user: args[1]}).pluck("message").sample(sample).run(bot.rconnection, function markovQuery(err, cursor){
            if(err){
                bot.editMessage({
                    channel: channel,
                    messageID: messageID,
                    message: "Error: "+err
                });
            }else{
                bot.log("Retrieved messages");
                var m = markov();
                var count = 0;
                cursor.toArray(function(err, array){
                    if(err){
                        bot.editMessage({
                            channel: channel,
                            messageID: messageID,
                            message: "Error: "+err
                        });
                    }else{
                        async.eachSeries(array, function(row, cb){
                            m.seed(row.message, function(){
                                count++;
                                bot.editMessage({
                                    channel: channel,
                                    messageID: messageID,
                                    message: "Generating Markov Chain (Seeded "+Math.floor((count/sample)*100)+"%)"
                                }, cb);
                            });

                        }, function(){
                            async.retry(10, function(cb){
                                var chain = m.forward(args[4] ? args[4] : m.pick(), length);
                                if(chain.length < 2)cb("narp");
                                else cb(null, chain.join(" "))
                            }, function(err, result){
                                bot.editMessage({
                                    channel: channel,
                                    messageID: messageID,
                                    message: "> "+(err ? "Insufficient data for meaningful answer" : result)
                                });
                            });

                        });
                    }
                });
            }
        });
       return true;
	}
};