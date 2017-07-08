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
                    timeout: 5000
                },
                {
                    regex: /(shit|bad|broken|terrible|rubbish) bot/i,
                    type: types.REACTION,
                    content: ["👎"]
                },
                {
                    regex: /(brilliant|great|amazing|good|cool) bot/i,
                    type: types.REACTION,
                    content: ["👍"]
                },
                {
                    regex: /the more you know/i,
                    type: types.REACTION,
                    content: ["🌈","⭐"]
                },
                {
                    regex: /too hot/i,
                    type: types.MESSAGE,
                    content: "_hot damn_",
                    timeout: 1000
                },
                {
                    regex: /(xd|e(cks|x)( ?)dee)/i,
                    type: types.REACTION,
                    content: ["🇽","🇩"],
                    timeout: 1000
                },
                {
                    regex: /whoop(,?) there it is/i,
                    type: types.MESSAGE,
                    content: "**WHO THE FUCK SAID THAT?**",
                    timeout: 5000
                }
            ];

            var timeouts = [];

            bot.registerMessageHandler("autoreply", function(user, userID, channelID, message, event, _bot, receiver){
                if (
                    bot.banCache.channel.indexOf(channelID) === -1 &&
                    bot.banCache.user.indexOf(userID) === -1) {
                    for (var i in bot.autoReplies) {
                        var reply = bot.autoReplies[i];
                        if (message.match(reply.regex) && (!reply.timeout || !timeouts[channelID] || !timeouts[channelID][i] || new Date().getTime() - timeouts[channelID][i] > reply.timeout)) {
                            if (reply.type === types.EMBED) {
                                receiver.sendMessage({
                                    to: channelID,
                                    message: "",
                                    embed: {
                                        image: {
                                            url: reply.content
                                        }
                                    }
                                });
                            } else if (reply.type === types.MESSAGE) {
                                receiver.sendMessage({
                                    to: channelID,
                                    message: reply.content
                                });
                            } else if (reply.type === types.REACTION) {
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
                                bot.processSpellQueue();
                            }

                            if (reply.timeout) {
                                if (timeouts[channelID]) {
                                    timeouts[channelID][i] = new Date().getTime();
                                } else {
                                    timeouts[channelID] = [];
                                    timeouts[channelID][i] = new Date().getTime();
                                }
                            }

                            bot.database.logCommand(userID, channelID, `${message} [AUTOREPLY MATCH ${reply.regex}]`)
                                .then(function(){
                                    bot.log(`${user} (${userID}) matched autoreply ${message}`);
                                })
                                .catch(function(err){
                                    bot.error(`Error logging autoreply: ${err.stack}`);
                                });
                        }
                    }
                }
            });

            cb();
        }
    }
};