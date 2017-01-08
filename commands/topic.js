var fs = require('fs');
var r = require('rethinkdb');
var async = require("async");
exports.command = {
	name: "topic",
	desc: "Add a *hilarious* comment from one of your good buddies to the topic.",
	usage: "topic [<message> *or* <username>] *or* next/set <id>",
	onReady: function(bot){
        bot.topicCounter = 0;
        bot.currentTopic = "";
        bot.lastTopic = "";

		bot.updateTopic = function(channel) {
            //TODO: Use .sample here
            bot.connection.query('SELECT * FROM Topics ORDER BY RAND() LIMIT 1', function(err, result) {
                if(err) {
                    bot.error(`Error getting topic list: ${err}`);
                } else {
                    var newTopic = result[0];

                    bot.currentTopic = newTopic.id;
                    bot.log(`Changing topic to ID ${newTopic.id}`);
                    bot.web_p.channels.setTopic(channel, `<${newTopic.username}> ${newTopic.topic}`);
                }
            });
		};

        bot.registerMessageHandler('topic', function topicUpdate(message, channelID){
            bot.topicCounter++;

            if(bot.topicCounter > bot.config.topic.threshold){
                bot.updateTopic(channelID);
                bot.topicCounter = 0;
            }
        });
	},
	func: function(user, userID, channel, args, message, bot){
		var index = args.length < 2 ? 1 : parseInt(args[1]);
		bot.log(`Index: ${index}`);

		if(isNaN(index)) {
            var command = args[1];
			if(command === 'set') {
				if(args.length < 3) {
                    return false;
                }

				var index = args[2];
                bot.connection.query('SELECT * FROM Topics WHERE id = ?', [index], function(err, result) {
                    if(err) {
                        bot.sendMessage({
                            to: channel,
                            message: `Error getting topic list: ${err}`
                        });
                    } else {
                        if(result.length > 0) {
                            var newTopic = result[0];
                            
                            bot.currentTopic = newTopic.id;
                            bot.log(`Changing topic to ID ${newTopic.id}`);
                            bot.web_p.channels.setTopic(channel, `<${newTopic.username}> ${newTopic.topic}`);
                        } else {
                            bot.sendMessage({
                                to: channel,
                                message: 'No topic with that ID found'
                            });
                        }
                    }
                });
			} else if(command === 'next') {
                bot.updateTopic(channel);
            } else if(command === 'count') {
                bot.connection.query('SELECT username, COUNT(*) count FROM Topics GROUP BY username ORDER BY count DESC', function(err, result) {
                    var out = [];
                    result.forEach(function(row) {
                        out.push(`*${row.username}*: ${row.count}`)
                    });

                    if(err) {
                        bot.sendMessage({
                            to: channel,
                            message: `Error: ${err}`
                        });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: out.join('\n')
                        });
                    }
                });
            } else if(command === 'removecurrent') {
                if(bot.currentTopic !== "") {
                    bot.connection.query('SELECT * FROM Topics WHERE id = ?', [bot.currentTopic], function(err, result) {
                        var oldTopic = result[0];
                        
                        bot.connection.query('DELETE FROM Topics WHERE id = ?', [bot.currentTopic], function(err, res) {
                            if(err) {
                                bot.sendMessage({
                                    to: channel,
                                    message: `Error deleting topic: ${err}`
                                });
                            } else {
                                bot.sendMessage({
                                    to: channel,
                                    message: `Removed *<${oldTopic.username}> ${oldTopic.topic}* from the list of topics.`
                                });
                            }
                        });
                    });

                } else {
                    bot.sendMessage({
                    	to: channel,
                    	message: 'Cannot delete topic that was set before restart'
                    });
                }
            } else if(command === 'removelast') {
                bot.connection.query('SELECT * FROM Topics WHERE id = ?', [bot.lastTopic], function(err, result) {
                    var oldTopic = result[0];
                    
                    bot.connection.query('DELETE FROM Topics WHERE id = ?', [bot.lastTopic], function(err, res) {
                        if(err) {
                            bot.sendMessage({
                                to: channel,
                                message: `Error deleting topic: ${err}`
                            });
                        } else {
                            bot.sendMessage({
                                to: channel,
                                message: `Removed *<${oldTopic.username}> ${oldTopic.topic}* from the list of topics.`
                            });
                        }
                    });
                });
			} else {
				return false;
			}

			return true;
		}

		bot.web_p.channels.history(channel, {count: !isNaN(index) ? index + 1 : 1}, function(err, resp) {
            if(err || !resp.ok) {
                if(!resp.ok && resp.error === "missing_scope"){
					bot.sendMessage({
						to: channel,
						message: JSON.stringify(resp)
					});
                    bot.sendMessage({
                    	to: channel,
                    	message: "The bot needs to be granted the permission `"+resp.needed+"` to topic messages."
                    });
                } else {
                    bot.sendMessage({
                        to: channel,
                        message: "Couldn't retrieve messages "+(err ? err : JSON.stringify(resp))
                    });
                }
            } else {
                var messages = resp.messages;
                bot.log(`${messages[index].user}, ${user}, ${userID}`);
                if(messages[index].user === userID) {
                    bot.sendMessage({
                    	to: channel,
                    	message: "_topicing something you said is like laughing at your own joke_ - Neil 2015"
                    });
                }
                bot.web.users.info(messages[index].user, function(err, user) {
                    if(err) {
                        bot.sendMessage({to: channel, message: "Error adding topic:\n "+err});
                    } else {
                        var username = user.user.name,
                            topic = messages[index].text;

                        bot.connection.query('INSERT INTO Topics (username, topic) VALUES (?, ?)', [username, topic], function(err, result) {
                            if(err) {
                                bot.sendMessage({
                                    to: channel,
                                    message: `Error adding topid: ${err}`
                                });
                            } else {
                                bot.lastTopic = result.insertId;
                                bot.sendMessage({
                                    to: channel,
                                    message: `Added *<${username}> ${topic}* to the list of topics.`
                                });
                            }
                        });
                    }
                });

            }
		});

		return true;
	}
};