/*
* Copyright UnacceptableUse 2016
 */

var dateformat = require('dateformat');
var poemMatch = /Roses are red\nViolets are blue\n&gt;([^\n]+)\n-([^ ]+) [0-9]{4}/;
exports.command = {
    name: "context",
    desc: "Get the context of a ",
    usage: "context [message].",
    func: function(user, userID, channel, args, message, bot) {
        if(bot.isDiscord)return true;
        function printContextOf(message, user){
            bot.connection.query('SELECT id FROM Messages WHERE message = ? AND user = ? LIMIT 1', [message, user], function(err, result) {
                if(err) {
                    bot.sendMessage({
                        to: channel,
                        message: `Error getting original message timestamp from message <${user}> ${message}\n${err}`
                    });
                } else {
                    if(result.length > 0) {
                        var row = result[0];
                        if(row.id) {
                            bot.connection.query('SELECT * FROM Messages WHERE id BETWEEN ? AND ?', [row.id - bot.config.contextAmount, row.id + bot.config.contextAmount], function(err, res) {
                                if(err) {
                                    bot.sendMessage({
                                        to: channel,
                                        message: `Error getting context: ${err}`
                                    });
                                } else {
                                    bot.log('Found some context. fuckin woo');
                                    var output = [];
                                    for(var i in res) {
                                        if(res.hasOwnProperty(i)) {
                                            var msg = res[i],
                                                date = dateformat(new Date(msg.time), 'UTC:dd/mm/yy HH:MM:ss Z'),
                                                contextMessage = `[${date}] <${msg.user}> ${msg.message}`;

                                            if(msg.message == message) {
                                                contextMessage = `*${contextMessage}*`;
                                            }

                                            output.push(`>${contextMessage}`);
                                        }
                                    }

                                    if(output.length > 0) {
                                        bot.sendMessage({
                                            to: channel,
                                            message: output.join('\n')
                                        });
                                    } else {
                                        bot.sendMessage({
                                            to: channel,
                                            message: `Unable to find context for: _<${user}> ${message}_`
                                        });
                                    }
                                }
                            });
                        } else {
                            bot.sendMessage({
                                to: channel,
                                message: `Could not determine timestamp for message. (${row.id})`
                            });
                        }
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: `Message not found in DB`
                        });
                    }
                }
            });
        }

        if(args.length < 2) {
            bot.web_p.channels.history(channel, {count: 40}, function(err, resp) {
                if(err || !resp.ok) {
                    if(!resp.ok && resp.error === "missing_scope"){
                        bot.sendMessage({
                            to: channel,
                            message: JSON.stringify(resp)
                        });

                        bot.sendMessage({
                            to: channel,
                            message: `The bot needs to be granted the permission \`${resp.needed}\` to use this command without arguments.`
                        });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: `Couldn't retrieve messages ${(err ? err : JSON.stringify(resp))}`
                        });
                    }
                } else {
                    var messages = resp.messages;
                    for(var i in messages) {
                        if(messages.hasOwnProperty(i)) {
                            var message = messages[i];
                            if(message.user === bot.config.slack.botUserId) { //TODO: get this dynamically
                                if(message.text.startsWith("Roses are red")) {
                                    var match = message.text.match(poemMatch);
                                    if(match && match.length > 0) {
                                        var text = match[1];
                                        var user = match[2];
                                        bot.log(`Matched it, trying to find it in the database... | User: ${user} | Message: ${text}`);
                                        printContextOf(text, user);
                                    } else {
                                        bot.sendMessage({
                                            to: channel,
                                            message: "Could not match message to poem regex: " + JSON.stringify(message.text)
                                        });
                                    }
                                    break;
                                }
                            } else if(message.user === bot.config.slack.topicUserId && message.text.indexOf("set the channel topic:") > -1) {
                                bot.log("Found topic message");
                                bot.connection.query('SELECT topic, username FROM Topics WHERE id = ?', [bot.currentTopic], function(err, result) {
                                    if(err || result.length === 0) {
                                        bot.sendMessage({
                                            to: channel,
                                            message: `Error getting topic: ${err}`
                                        });
                                    } else {
                                        var row = result[0];
                                        printContextOf(row.topic, row.username);
                                    }
                                });

                                break;
                            }
                        }
                    }
                }
            });
        }
        
        return true;
    }
};
