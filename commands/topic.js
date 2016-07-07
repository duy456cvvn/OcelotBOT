var fs = require('fs');
exports.command = {
	name: "topic",
	desc: "Add a *hilarious* comment from one of your good buddies to the topic.",
	usage: "topic [<message> *or* <username>] *or* [up] [down] [set <index>]",
	onReady: function(bot){
        bot.currentTopic = 0;
        bot.topicCounter = 0;

        fs.readFile("topic.dat", function readTopicFile(err, data){
            if(err){
                bot.log("Error loading topic index file: "+err);
            } else{
                bot.currentTopic = parseInt(data);
                bot.log("Topic index loaded successfully ("+bot.currentTopic+")");
            }
        });

		bot.incrementTopic = function (channel) {
			bot.currentTopic++;
			bot.updateTopic(channel);
		};

		bot.decrementTopic = function (channel) {
			if (bot.currentTopic > 0) {
				bot.currentTopic--;
				bot.updateTopic(channel);
			}
		};

		bot.setTopic = function (index) {
			bot.currentTopic = index;
		};

		bot.updateTopic = function (channel) {
			bot.connection.query("SELECT `topic` FROM stevie.Topics WHERE `id` = ?;", [bot.currentTopic], function topicUpdateQuery(err, result) {
				if (err || !result[0] || !result[0].topic) {
					bot.currentTopic++;
					bot.sendMessage({
						to: channel,
						message: "Could not switch topic, best log this on producteev and pester @Peter until he fixes it: " + err
					});
				} else {
					bot.log("Changing topic to ID "+bot.currentTopic);
					bot.web_p.channels.setTopic(channel, result[0].topic);
				}
				fs.writeFile(bot.config.topic.file, bot.currentTopic, function topicFileWriteError(err) {
					if (err) {
						bot.log("Could not save topic! " + err);
					}
				});
			});

		};


        bot.registerMessageHandler("topic", function topicUpdate(message, channelID){
            bot.topicCounter++;

            if(bot.topicCounter > bot.config.topic.threshold){
                bot.incrementTopic(channelID);
                bot.topicCounter = 0;
            }
        });


	},
	func: function(user, userID, channel, args, message, bot){
		var index = args.length < 2 ? 1 : parseInt(args[1]);
		bot.log("Index: "+index);
		if(isNaN(index)){
			if(args[1] === "set"){
				if(args.length < 3){
					return false;
				}

				var index = parseInt(args[2]);
				if(isNaN(index)){
					return false;
				}

				bot.setTopic(index);
				bot.updateTopic(channel);
			}else if(args[1] === "up"){
				bot.incrementTopic(channel);
			}else if(args[1] === "down"){
				if(bot.currentTopic === 0){
					bot.sendMessage({to: channel, message: "You've hit rock bottom."});
				}else{
					bot.decrementTopic(channel);
				}
			}else{
				return false;
			}
			return true;
		}

		bot.web_p.channels.history(channel, {count: !isNaN(index) ? index + 1 : 1}, function(err, resp){
            if(err || !resp.ok){
                if(!resp.ok && resp.error === "missing_scope"){
					bot.sendMessage({
						to: channel,
						message: JSON.stringify(resp)
					});
                    bot.sendMessage({
                    	to: channel,
                    	message: "The bot needs to be granted the permission `"+resp.needed+"` to topic messages."
                    });
                }else
                    bot.sendMessage({
                        to: channel,
                        message: "Couldn't retrieve messages "+(err ? err : JSON.stringify(resp))
                    });
            }else{
                var messages = resp.messages;
                bot.web.users.info(messages[index].user, function(err, user){
                    if(err){
                        bot.sendMessage({to: channel, message: "Error adding topic:\n "+err});
                    }else{
                        var thisMessage = "<"+user.user.name+"> "+messages[index].text;
                        bot.connection.query("INSERT INTO `stevie`.`Topics` (`topic`) VALUES (?)", [thisMessage], function(err, result){
                            if(err){
                                bot.sendMessage({to: channel, message: "Error adding topic:\n "+err.message});
                            }else{
                                bot.sendMessage({to: channel, message: "Added *"+thisMessage+"* to the list of topics."});
                            }
                        });
                    }
                });

            }
		});

		return true;
	}
};