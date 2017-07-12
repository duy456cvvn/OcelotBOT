/**
 * Created by Peter on 08/07/2017.
 */

const types = {
    EMBED: 0,
    MESSAGE: 1,
    REACTION: 2
};

module.exports = function(bot){
    return {
        name: "Autoreplies  Module",
        enabled: true,
        init: function init(cb) {
            bot.autoReplies = [
                {
                    regex: /alot/i,
                    type: types.EMBED,
                    content: "http://4.bp.blogspot.com/_D_Z-D2tzi14/S8TRIo4br3I/AAAAAAAACv4/Zh7_GcMlRKo/s400/ALOT.png",
                    timeout: 10000
                },
                {
                    regex: /(shit|bad|broken|terrible|rubbish) bot/i,
                    type: types.REACTION,
                    content: ["👎"],
                    timeout: 5000
                },
                {
                    regex: /(brilliant|great|amazing|good|cool) bot/i,
                    type: types.REACTION,
                    content: ["👍"],
                    timeout: 5000
                },
                {
                    regex: /the more (yo?)u know/i,
                    type: types.REACTION,
                    content: ["🌈","⭐"],
                    timeout: 5000
                },
                {
                    regex: /(2|to(o?)) hot$/i,
                    type: types.MESSAGE,
                    content: "_hot damn_",
                    timeout: 5000
                },
                {
                    regex: /(xd|e(cks|x)( ?)dee)d*($| .*)/i,
                    type: types.REACTION,
                    content: ["🇽","🇩"],
                    timeout: 60000
                },
                {
                    regex: /whoop(,?) there it is/i,
                    type: types.MESSAGE,
                    content: "**WHO THE FUCK SAID THAT?**",
                    timeout: 5000
                },
                {
                    regex: /🤔/,
                    type: types.REACTION,
                    content: ["🤔"],
                    timeout: 5000
                }
            ];

            var timeouts = [];

            bot.registerMessageHandler("autoreply", function messageHandler(user, userID, channelID, message, event, _bot, receiver){
                receiver.getServerFromChannel(channelID, function(err, server){
                    if (
                        bot.banCache.server.indexOf(server) === -1 &&
                        bot.banCache.channel.indexOf(channelID) === -1 &&
                        bot.banCache.user.indexOf(userID) === -1) {
                        for (let i in bot.autoReplies) {
                            if (bot.autoReplies.hasOwnProperty(i)) {
                                let reply = bot.autoReplies[i];
                                if (message.match(reply.regex) && (!reply.timeout || !timeouts[channelID] || !timeouts[channelID][i] || new Date().getTime() - timeouts[channelID][i] > reply.timeout)) {
                                    bot.database.getServer(server)
                                        .then(function(result){
                                            var serverSettings = result[0] || {enableAutoReplies: 1, enableAutoReactions: 1};
                                            var happened = false;
                                            if (reply.type === types.EMBED && serverSettings.enableAutoReplies) {
                                                receiver.sendMessage({
                                                    to: channelID,
                                                    message: "",
                                                    embed: {
                                                        image: {
                                                            url: reply.content
                                                        }
                                                    }
                                                });
                                                happened = true;
                                            } else if (reply.type === types.MESSAGE && serverSettings.enableAutoReplies) {
                                                receiver.sendMessage({
                                                    to: channelID,
                                                    message: reply.content
                                                });
                                                happened = true;
                                            } else if (reply.type === types.REACTION && serverSettings.enableAutoReactions) {
                                                for (var j in reply.content) {
                                                    bot.spellQueue.push({
                                                        channelID: channelID,
                                                        messageID: event.d.id,
                                                        reaction: reply.content[j],
                                                        retries: 0,
                                                        receiver: receiver,
                                                        time: new Date()
                                                    });
                                                }
                                                happened = true;
                                                bot.processSpellQueue();
                                            }

                                            if(happened) {
                                                if (reply.timeout) {
                                                    if (timeouts[channelID]) {
                                                        timeouts[channelID][i] = new Date().getTime();
                                                    } else {
                                                        timeouts[channelID] = [];
                                                        timeouts[channelID][i] = new Date().getTime();
                                                    }
                                                }

                                                bot.database.logCommand(userID, channelID, `${message} [AUTOREPLY MATCH ${i} ${reply.regex}]`)
                                                    .then(function logAutoreply() {
                                                        bot.log(`${user} (${userID}) matched autoreply ${message}`);
                                                    })
                                                    .catch(function (err) {
                                                        bot.error(`Error logging autoreply: ${err.stack}`);
                                                    });
                                            }
                                        })
                                        .catch(function(err){
                                           console.error(err);
                                        });
                                }
                            }
                        }
                    }
                });
            });
            cb();
        }
    }
};