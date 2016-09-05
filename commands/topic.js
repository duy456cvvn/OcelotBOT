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

		bot.updateTopic = function (channel) {
            //TODO: Use .sample here
            r.db("ocelotbot").table("topics").run(bot.rconnection, function topicUpdateQuery(err, cursor){
                if(err){
                    bot.error("Error getting topic list: "+err);
                }else{
                    cursor.toArray(function cursorToArray(err, result){
                        if(err){
                            bot.error("Error converting cursor to array: "+err);
                        }else{
                            var newTopic = result[parseInt(Math.random() * result.length)];
                            bot.currentTopic = newTopic.id;
                            bot.log("Changing topic to ID "+newTopic.id);
                            bot.web_p.channels.setTopic(channel, `<${newTopic.username}> ${newTopic.topic}`);
                        }
                    });
                }
            });
		};


        bot.registerMessageHandler("topic", function topicUpdate(message, channelID){
            bot.topicCounter++;

            if(bot.topicCounter > bot.config.topic.threshold){
                bot.updateTopic(channelID);
                bot.topicCounter = 0;
            }
        });


	},
	func: function(user, userID, channel, args, message, bot){
		var index = args.length < 2 ? 1 : parseInt(args[1]);
		bot.log("Index: "+index);
		if(isNaN(index)){
			if(args[1] === "set"){
				if(args.length < 3)return false;

				var index = args[2];
                r.db("ocelotbot").table("topics").get(index).run(bot.rconnection, function topicUpdateQuery(err, newTopic){
                    if(err){
                        bot.sendMessage({
                        	to: channel,
                        	message: "Error getting topic list: "+err
                        });
                    }else{
                        if(newTopic){
                            bot.currentTopic = newTopic.id;
                            bot.log("Changing topic to ID "+newTopic.id);
                            bot.web_p.channels.setTopic(channel, `<${newTopic.username}> ${newTopic.topic}`);
                        }else{
                            bot.sendMessage({
                            	to: channel,
                            	message: "No topic with that ID found"
                            });
                        }
                    }
                });
			}else if(args[1] === "next") {
                bot.updateTopic(channel);
            }else if(args[1] === "count") {
                r.db("ocelotbot").table("topics").getField("username").distinct().run(bot.rconnection, function userCountQuery(err, result) {
                    var counts = {};
                    var out = "Topic counts by username:\n";
                    async.each(result, function (val, cb) {
                        r.db('ocelotbot').table('topics').filter({username: val}).count().run(bot.rconnection, function getCountForUser(err, count) {
                           if(err){
                               counts["ERR "+err] = 0;
                           }else{
                               counts[val] = count;
                           }
                            cb();
                        });
                    }, function (err) {
                        var sortedKeys = Object.keys(counts).sort(function(a,b){return counts[b]-counts[a]});
                        for(var i in sortedKeys){
                            out += "*" + sortedKeys[i] + "*: " + counts[sortedKeys[i]]+ "\n"
                        }
                        if (err) {
                            bot.sendMessage({
                                to: channel,
                                message: "Error: " + err
                            });
                        } else {
                            bot.sendMessage({
                                to: channel,
                                message: out
                            });
                        }
                    });
                });
            }else if(args[1] === "removecurrent"){
                if(bot.currentTopic !== "") {
                    r.db("ocelotbot").table("topics").get(bot.currentTopic).delete({returnChanges: true}).run(bot.rconnection, function topicUpdateQuery(err, result) {
                        if (err) {
                            bot.sendMessage({
                                to: channel,
                                message: "Error deleting topic: " + err
                            });
                        } else {
                            var oldTopic = result.changes[0].old_val;
                            bot.sendMessage({
                                to: channel,
                                message: "Removed *<"+oldTopic.username+"> "+oldTopic.topic+"* from the list of topics."
                            });
                        }
                    });
                }else{
                    bot.sendMessage({
                    	to: channel,
                    	message: "Cannot delete topic that was set before restart"
                    });
                }
            }else if(args[1] === "removelast"){
                r.db("ocelotbot").table("topics").get(bot.lastTopic).delete({returnChanges: true}).run(bot.rconnection, function topicUpdateQuery(err, result) {
                    if (err) {
                        bot.sendMessage({
                            to: channel,
                            message: "Error deleting topic: " + err
                        });
                    } else {
                        var oldTopic = result.changes[0].old_val;

                        bot.sendMessage({
                            to: channel,
                            message: "Removed *<"+oldTopic.username+"> "+oldTopic.topic+"* from the list of topics."
                        });
                    }
                });
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
                bot.log(messages[index].user+", "+user+", "+userID);
                if(messages[index].user === userID){
                    bot.sendMessage({
                    	to: channel,
                    	message: "_topicing something you said is like laughing at your own joke_ - Neil 2015"
                    });
                }
                bot.web.users.info(messages[index].user, function(err, user){
                    if(err){
                        bot.sendMessage({to: channel, message: "Error adding topic:\n "+err});
                    }else{
                        r.db("ocelotbot").table("topics").insert({username: user.user.name, topic: messages[index].text}, {returnChanges: true}).run(bot.rconnection, function(err, result){
                            if(err){
                                bot.sendMessage({
                                    to: channel,
                                    message: "Error adding topic: "+err
                                });
                            }else{
                                bot.lastTopic = result.changes[0].new_val.id;
                                bot.sendMessage({
                                    to: channel,
                                    message: "Added *<"+user.user.name+"> "+messages[index].text+"* to the list of topics."
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