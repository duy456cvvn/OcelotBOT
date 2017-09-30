/**
 * Created by Peter on 07/06/2017.
 */
const fs = require('fs');
const async = require('async');
const config = require('config');
module.exports = function(bot){

    function isBanned(server, channel, user){
        return !(bot.banCache.server.indexOf(server) === -1 &&
            bot.banCache.channel.indexOf(channel) === -1 &&
            bot.banCache.user.indexOf(user) === -1);
    }

    function getPrefix(server){
        return bot.prefixCache[server] || "!"
    }

    return {
      name: "Commands Module",
      enabled: true,
      init: function init(cb){
        bot.log("Loading Commands...");
        bot.banCache = {
            channel: [],
            server: [],
            user: []
        };

        bot.database.getBans()
            .then(function(result){
                async.eachSeries(result, function(ban, cb){
                    bot.banCache[ban.type].push(ban.id);
                    cb();
                });
            });

        bot.commands = {};
        bot.commandUsages = {};
        fs.readdir("commands", function readCommands(err, files){
            if(err){
                bot.error("Error reading from commands directory");
                bot.error(err);
                cb(err);
            }else{
                async.eachSeries(files, function loadCommands(command, callback){
                    if(!fs.lstatSync("commands/" + command).isDirectory()) {
                        var loadedCommand = require("../commands/" + command);
                        if (loadedCommand.init) {
                            loadedCommand.init(bot, function () {
                                bot.log(`Performed startup tasks for ${loadedCommand.name}`);
                            });
                        }
                        bot.log(`Loaded command ${loadedCommand.name}`);
                        bot.commandUsages[loadedCommand.name] = {
                            usage: loadedCommand.usage,
                            accessLevel: loadedCommand.accessLevel,
                            receivers: loadedCommand.receivers,
                            hidden: loadedCommand.hidden
                        };
                        for (var i in loadedCommand.commands) {
                            if (loadedCommand.commands.hasOwnProperty(i)) {
                                bot.commands[loadedCommand.commands[i]] = loadedCommand.run;
                            }
                        }
                    }
                    callback();
                }, cb);
            }
        });

        bot.prefixCache = {};

        bot.commandCooldowns = {};
        bot.cooldownCounts = {};

        setInterval(function(){
            bot.commandCooldowns = {};
        }, parseInt(config.get("Bot.cooldownInterval")));

        bot.database.getPrefixes()
            .then(function(result){
                 for(var i in result){
                     if(result.hasOwnProperty(i))
                        bot.prefixCache[result[i].server] = result[i].prefix;
                 }
            })
            .catch(function(err){
                bot.error("Error loading prefix cache: ");
                console.error(err);
            });


        bot.registerMessageHandler("commands", async function(user, userID, channelID, message, event, _bot, receiver){
        	var wasCommand = false;
            try {
                var server = await receiver.getServerFromChannel(channelID);
				if (message.startsWith(getPrefix(server))) {
					var args = message.split(" ");
					const commandName = args[0].substring(getPrefix(server).length).toLowerCase();
					var command = bot.commands[commandName];
					if (!isBanned(server, channelID, userID) && command) {
						wasCommand = true;
						bot.commandCount++;

						var cooldown = bot.commandCooldowns[userID];
						if(cooldown){
							if(cooldown[commandName]){
								cooldown[commandName]++;
							}else{
								cooldown[commandName] = 1;
							}
						}else{
							bot.commandCooldowns[userID] = {
								[commandName]: 1
							};
						}

						async function log(message){
							try{
								await bot.database.logCommand(userID, channelID, message)
							}catch(err){
								bot.error(`Error logging command: ${err.stack}`);
							}finally{
								bot.log(`${user} (${userID}) in ${server} performed command ${message}`);
							}
						}

						if(cooldown && cooldown[commandName] && cooldown[commandName] >= config.get("Bot.softCooldown")){
							if(cooldown[commandName] >= config.get("Bot.hardCooldown")){
								log(message+" [HARD COOLDOWN]");

								var cooldownCount = bot.cooldownCounts[userID];
								if(cooldownCount){
									bot.cooldownCounts[userID]++;
									if(bot.cooldownCounts[userID] == 5){
										receiver.sendMessage({
											to: channelID,
											message: ":warning: **If you trigger more cooldowns within the next hour you will be banned from using OcelotBOT.**"
										});
									}else if(bot.cooldownCounts[userID] > 5){
										receiver.sendMessage({
											to: channelID,
											message: ":wave: **<@"+userID+">, you have been banned from using OcelotBOT.**"
										});
										await bot.database.ban(userID, "USER", `Auto: ${bot.cooldownCounts[userID]} hard cooldowns on command ${commandName}`);
										bot.banCache["user"].push(userID);
									}
								}else{
									bot.cooldownCounts[userID] = 1;
								}
								bot.warn(`Hard cooldown #${bot.cooldownCounts[userID]} triggered by ${user} (${userID})`);
							}else{
								log(message+" [SOFT COOLDOWN]");
								bot.log(`Soft cooldown triggered by ${user} (${userID})`);
								receiver.sendMessage({
									to: channelID,
									message: ":watch: Wait a while before performing this command again!"
								});
							}
						}else{
							log(message);
							command(user, userID, channelID, message, args, event, bot, receiver, message.indexOf("-DEBUG") > -1, server);
						}
					}
				}

            }catch(e){
            	if(wasCommand){
					receiver.sendMessage({
						to: channelID,
						message: ":bangbang: Command failed: " + e
					});
					bot.error(`Command ${message} failed: ${e}`);
				}else{
            		bot.error(`Message ${message} caused error:`);
				}

				if(e.stack)
                	bot.error(e.stack);
            }
        });
      }
    }
};

