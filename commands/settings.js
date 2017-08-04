/**
 * Created by Peter on 09/06/2017.
 */
const pasync = require('promise-async');
module.exports = {
    name: "Server Settings",
    usage: "settings [set/help/list]",
    accessLevel: 1,
    commands: ["settings", "serversettings"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {

        const settings = {
            prefix: {
                explanation: "The prefix that goes before commands i.e !spongebob or !settings",
                format: function format(value){
                    return "`"+value+"`";
                },
                onSet: function(newVal){
                    bot.prefixCache[server] = newVal;
                    bot.ipc.emit("broadcast", {event: "clearPrefixCache"});
                },
            },
            enableAutoReactions: {
                explanation: "Enables the bot reacting to things like xD and 'the more you know'",
                format: function format(value){
                    return !!value;
                }
            },
            enableAutoReplies: {
                explanation: "Enables the bot replying to things like 'alot'",
                format: function format(value){
                    return !!value;
                }
            },
            allowNSFW: {
                explanation: "Enable NSFW results in commands such as !image",
                format: function format(value){
                    return !!value;
                }
            }
        };
        bot.database.getServer(server)
            .then(function(results){
                var serverInfo = results[0];
                var hasRole = false;
                var subCommands = {
                    "list": function(){
                        var output = "**Available Settings:**\n";
                        for(var i in serverInfo){
                            if(serverInfo.hasOwnProperty(i) && settings[i]){
                                output += `**${i}** - ${settings[i].format(serverInfo[i])}\n`
                            }
                        }
                        recv.sendMessage({
                            to: channel,
                            message: output
                        });
                    },
                    "set": function(){
                        if(args.length < 4){
                            recv.sendMessage({
                                to: channel,
                                message: `:bangbang: You must supply a **setting** and a **value**:\n${bot.prefixCache[server]}settings set useServerCurrency false`
                            });
                        }else if(Object.keys(settings).indexOf(args[2]) > -1){
                            bot.database.setServerSetting(server, args[2], args[3] === "true" || args[3] === "false" ? args[3] === "true" : args[3])
                                .then(function(){
                                    recv.sendMessage({
                                        to: channel,
                                        message: `:white_check_mark: Successfully set ${args[2]} to **${args[3]}**`
                                    });
                                    if(settings[args[2]].onSet)
                                        settings[args[2]].onSet(args[3]);
                                })
                                .catch(function(err){
                                    recv.sendMessage({
                                        to: channel,
                                        message: `Error setting value. Did you spell something wrong?:\n\`${err}\``
                                    })
                                });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: `:bangbang: Not a valid setting. Try ${bot.prefixCache[server]}settings list`
                            });
                        }
                    },
                    "help": function(){
                        if(Object.keys(settings).indexOf(args[2]) > -1){
                            recv.sendMessage({
                                to: channel,
                                message: settings[args[2]].explanation
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: `:bangbang: Not a valid setting. Try ${bot.prefixCache[server]}settings list.`
                            });
                            bot.log(args[3]);
                        }
                    }
                };


                recv.getServerInfo(server, function(err, serverData){
                    if(!serverData){
                        recv.sendMessage({
							to: channel,
							message: ":warning: Either this is a DM channel, or there is an issue with the database connection.\nPlease use this command in a server, or try again later."
						})
                    }else{
						for(var i in serverData.members[userID].roles){
							if(serverData.members[userID].roles.hasOwnProperty(i)) {
								var role = serverData.roles[serverData.members[userID].roles[i]];
								if (role.name.toLowerCase() === "bot controller") {
									hasRole = true;
									break;
								}
							}
						}
						//noinspection EqualityComparisonWithCoercionJS
						if(userID != "139871249567318017" && serverInfo.addedby != userID && !hasRole){
							recv.sendMessage({
								to: channel,
								message: ":bangbang: You don't have permission to run this command! Only the server owner or people with the 'Bot Controller' role can do that."
							});
						}else{
							if(!args[1] || (args[1] === "help" && !args[2]) || !subCommands[args[1]]){
								recv.sendMessage({
									to: channel,
									message: `**Usage:**\n${bot.prefixCache[server]}settings help [setting] - This message or help on an individual setting\n${bot.prefixCache[server]}settings list - List the available settings and their current values\n${bot.prefixCache[server]}settings set [setting] [value] - Set a new value for a server setting`
								});
							}else{
								subCommands[args[1]]();
							}
						}
                    }
                });
            });
    }
};