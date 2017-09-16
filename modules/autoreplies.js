/**
 * Created by Peter on 08/07/2017.
 */

const types = {
    EMBED: 0,
    MESSAGE: 1,
    REACTION: 2
};

const fs = require('fs');

module.exports = function(bot){
    return {
        name: "Autoreplies Module",
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
                    regex: /(xd|e(cks|x)( ?)de(e?))d*($| .*)/i,
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
                },
                {
					regex: /emoji( ?)(movie|film)/i,
					type: types.REACTION,
					content: ["🙃", "🔫"],
					timeout: 5000
                },
				{
					regex: /(england i[sz] m[ya] city|jake paul)/i,
					type: types.REACTION,
					content: ["🇬🇧", "🏙"],
					timeout: 5000
				}
            ];

            var timeouts = [];

            bot.registerMessageHandler("autoreply", async function messageHandler(user, userID, channelID, message, event, _bot, receiver){
                if(!message)return;
                try{
                	if(userID == "97322624866070528" && message.indexOf("sad") > -1){
                		fs.readFile("./lamados.txt", function(err, data){
                			var num = data.toString();
                			if(!err && parseInt(num) != undefined){
                				var amt = parseInt(num);
                				amt++;
								fs.writeFile("./lamados.txt", amt, function(err){
									bot.log("Incremented lamados counter "+amt);
								});
							}else{
                				bot.error(err ? err.stack : "Invalid number in lamados.txt "+data);
							}
						});



					}
                	var serverID = await receiver.getServerFromChannel(channelID);
                    if (
                        bot.banCache.server.indexOf(serverID) === -1 &&
                        bot.banCache.channel.indexOf(channelID) === -1 &&
                        bot.banCache.user.indexOf(userID) === -1) {
                        for (let i in bot.autoReplies) {
                            if (bot.autoReplies.hasOwnProperty(i)) {
                                let reply = bot.autoReplies[i];
                                if (message.match(reply.regex) && (!reply.timeout || !timeouts[channelID] || !timeouts[channelID][i] || new Date().getTime() - timeouts[channelID][i] > reply.timeout)) {
                                    var serverSettings = await bot.database.getServer(serverID)[0] || {enableAutoReplies: 0, enableAutoReactions: 0};
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
										await bot.database.logCommand(userID, channelID, `${message} [AUTOREPLY MATCH ${i} ${reply.regex}]`);
										bot.log(`${user} (${userID}) in ${serverID} matched autoreply ${message}`);
									}
                                }
                            }
                        }
                    }
				}catch(e){
                	bot.error("Error during autoreply match: "+e);
					bot.error(e.message+""+e.stack);
				}
            });
            cb();
        }
    }
};