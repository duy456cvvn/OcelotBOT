/**
 * Created by Peter on 05/07/2017.
 */

const ipc = require('node-ipc');
const config = require('config');
const async = require('async');


const conflictingBots = [
    "189702078958927872", //ErisBot
    "256530827842813962", //Fergus
    "290225453354975232", //LoLPromoter
    "107256979105267712", //KupoBot
    "81026656365453312", //Gravebot
    "86920406476292096", //Lopez
    "242728049131388930", //QT Bot
    "324356264983527424", //MatBot
	"265161580201771010", //MatBot
	"172002275412279296", //Tatsumaki,
	"204777316621090816", //RPBot
	"292953664492929025", //UnbelievableBot
];

module.exports = function(bot){
    return {
        name: "Broker Communication Module",
        enabled: true,
        init: function init(cb) {

            bot.waitingCallbacks = {};
            var callbackIDs = 0;
            bot.instance = parseInt(process.argv[2]);

            ipc.config.id = 'ocelotbot-'+bot.instance;
            ipc.config.retry = 1000;
            ipc.config.silent = true;

            const socket = config.get("Broker.socket");

            bot.log(`This is ${ipc.config.id}`);
            cb();

            ipc.connectTo(socket, function ipcConnect(){
                bot.ipc = ipc.of[socket];
                bot.log(`Connecting to ${socket}`);
                bot.ipc.on("connect", function ipcConnected(){
                    bot.log(`Connected to IPC on ${socket}`);
                    bot.ipc.emit('instanceReady', {instance: bot.instance});


                    bot.emitWithCallback("command", {
                        receiver: "discord",
                        args: ["bot.receivers.discord.internal.client.servers", undefined],
                        command: "eval",
                    }, function(err, result){
                        bot.serverCache = result;
                    });

                    bot.emitWithCallback("command", {
                        receiver: "discord",
                        args: ["bot.receivers.discord.internal.client.channels", undefined],
                        command: "eval",
                    }, function(err, result){
                        bot.channelCache = result;
                    });

                });

                bot.ipc.on("receiveMessage", function(data){
                    data.push(bot);
                    bot.receiveMessage.apply(this, data)
                });

                bot.ipc.on("clearBanCache", function clearBanCache(){
                    bot.log("Clearing ban cache....");
                    bot.banCache = {
                        channel: [],
                        server: [],
                        user: []
                    };

                    bot.database.getBans()
                        .then(function(result){
                            async.eachSeries(result, function(ban){
                                bot.banCache[ban.type].push(ban.id);
                            });
                        });
                });

                bot.ipc.on("clearPrefixCache", function clearBanCache(){
                    bot.log("Clearing prefix cache....");
                    bot.prefixCache = {};

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
                });

                if(bot.instance === 1) {

                    bot.ipc.emit("subscribeEvent", {event: "guildCreate"});
                    bot.ipc.emit("subscribeEvent", {event: "guildDelete"});

                    bot.ipc.on("guildCreate", function(data){
                        var server = data[0];
                        bot.database.addServer(server.id, server.owner_id, server.name, server.joined_at)
                            .then(function(){
                                bot.log(`Joined server ${server.name} (${server.id})`);
                                var conflicts = [];

                                for(var i = 0; i < conflictingBots.length; i++){
                                    if(Object.keys(server.members).indexOf(conflictingBots[i]) > -1){
                                        conflicts.push(conflictingBots[i]);
                                    }
                                }
                                if(conflicts.length > 0){
                                    bot.log(`Detected ${conflicts.length} conflicts in ${server.id}`);
                                    bot.receiver.sendMessage({
                                        to: server.id,
                                        message: `:warning: Heads up: **${conflicts.length}** bots in this server use the same default prefix (!) as I do.\nYou can change my prefix using \`!settings set prefix whatever\` to avoid problems.`
                                    });
                                }
                            })
                            .catch(function(err){
                                if(err.message.indexOf("Duplicate") === -1){
                                    bot.error(err.message);
                                }
                            });
                    });

                    bot.ipc.on("guildDelete", function(data){
                       bot.log(`Left Server ${data[0].name} (${data[0].id})`);
                       bot.database.leaveServer(data[0].id)
                            .then(function(){
                                bot.log("Logged server leave");
                            })
                           .catch(function(err){
                               console.error(err);
                           })
                    });
                }

                bot.ipc.on("callback", function(data){
                    bot.waitingCallbacks[data.id].apply(this, data.args);
                    delete bot.waitingCallbacks[data.id];
                });


                bot.ipc.on('disconnect', function ipcDisconnect(){
                    bot.warn("IPC Disconnected");
                });

                bot.ipc.on('message', function(data){
                    console.log(data);
                });
            });

			bot.serverCache = {};
            bot.channelCache = {};


            bot.emitWithCallback = function emitWithCallback(command, data, callback){
                var callbackNumber = callbackIDs++;
                bot.waitingCallbacks[callbackNumber] = callback;
                data.callbackID = callbackNumber;
                bot.ipc.emit(command, data);
            };


            bot.receiver = new Proxy({
                id: "discord",
                getServerFromChannel: function getServerFromChannel(channel, cb){
                	if(!cb){
                		return new Promise(function(fulfill, reject){
							if(bot.channelCache[channel]){
								fulfill(bot.channelCache[channel].guild_id);
							}else{
								bot.emitWithCallback("command", {
									receiver: bot.lastRecvID,
									args: Array.from(arguments),
									command: "getChannelInfo",
								}, function(err, channelInfo){
									bot.log(`Populating bot.channelCache for channel ${channel}`);
									if(channelInfo && !err){
										bot.channelCache[channel] = channelInfo;
										fulfill(channelInfo.guild_id);
									}else{
										bot.warn(`Tried to get server from channel that does not exist!!! ${channel}`);
										fulfill(null);
									}
								});
							}
						});
					}else if(bot.channelCache[channel]){
						cb(null, bot.channelCache[channel].guild_id);
					}else{
						bot.emitWithCallback("command", {
							receiver: bot.lastRecvID,
							args: Array.from(arguments),
							command: "getChannelInfo",
						}, function(err, channelInfo){
							bot.log(`Populating bot.channelCache for channel ${channel}`);
							if(channelInfo){
								bot.channelCache[channel] = channelInfo;
								cb(null, channelInfo.guild_id);
							}else{
								bot.warn(`Tried to get server from channel that does not exist!!! ${channel}`);
								cb("Channel Does Not Exist", null);
							}
						});
					}
                },
                getChannelInfo: function getChannelInfo(channel, cb){
                	if(!cb){
                		return new Promise(function(fulfill, reject){
							if(bot.channelCache[channel]){
								fulfill(bot.channelCache[channel]);
							}else{
								bot.emitWithCallback("command", {
									receiver: bot.lastRecvID,
									args: Array.from(arguments),
									command: "getChannelInfo",
								}, function(err, channelInfo){
									if(err){
										bot.error(err);
										reject(err);
									}else{
										bot.log(`Populating bot.channelCache for channel ${channel}`);
										bot.channelCache[channel] = channelInfo;
										fulfill(channelInfo);
									}
								});
							}
						});
					}else if(bot.channelCache[channel]){
						cb(null, bot.channelCache[channel]);
					}else{
						bot.emitWithCallback("command", {
							receiver: bot.lastRecvID,
							args: Array.from(arguments),
							command: "getChannelInfo",
						}, function(err, channelInfo){
							bot.log(`Populating bot.channelCache for channel ${channel}`);
							bot.channelCache[channel] = channelInfo;
							cb(null, channelInfo);
						});
					}
                },
                getServerInfo: function getServerInfo(server, cb){
                	if(!cb){
                		return new Promise(function(fulfill, reject){
							if(bot.serverCache[server]){
								fulfill(bot.serverCache[server]);
							}else{
								bot.emitWithCallback("command", {
									receiver: bot.lastRecvID,
									args: Array.from(arguments),
									command: "getServerInfo",
								}, function(err, serverInfo){
									if(err){
										bot.error(err);
										reject(err);
									}else{
										bot.log(`Populating bot.serverCache for channel ${server}`);
										bot.serverCache[server] = serverInfo;
										fulfill(serverInfo);
									}
								});
							}
						});
					}else if(bot.serverCache[server]){
						cb(null, bot.serverCache[server]);
					}else{
						bot.emitWithCallback("command", {
							receiver: bot.lastRecvID,
							args: Array.from(arguments),
							command: "getServerInfo",
						}, function(err, serverInfo){
							bot.log(`Populating bot.serverCache for channel ${server}`);
							bot.serverCache[server] = serverInfo;
							cb(null, serverInfo);
						});
					}
				}
            }, {
                get: function proxyGet(target, command){
                    return target[command] || function proxyToBroker(){
                        const hasCallback = typeof arguments[arguments.length-1] == "function";
                        if(hasCallback){
                            var callback = arguments[arguments.length-1];
                            var callbackNumber = callbackIDs++;
                            bot.log(`Callback for ${command} has ID ${callbackNumber}`);
                            bot.waitingCallbacks[callbackNumber] = callback;
                            delete arguments[arguments.length-1];
                        }
                        bot.ipc.emit("command", {
                            receiver: bot.lastRecvID,
                            args: Array.from(arguments),
                            command: command,
                            callbackID: callbackNumber
                        });
                    }
                }
            });

            process.on('beforeExit', function(){
                console.log("Exiting");
                if(bot.rpc){
                    bot.rpc.emit("instanceDisconnect", {instance: bot.instance});
                }
            });
        }
    }
};