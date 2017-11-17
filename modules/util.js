/**
 * Created by Peter on 01/07/2017.
 */

const async = require('async');
module.exports = function(bot){
    return {
        name: "Utilities  Module",
        enabled: true,
        init: function init(cb) {

            bot.util = {};

            bot.util.WS_CLOSE_CODES = {
				1000: "CLOSE_NORMAL",
				1001: "CLOSE_GOING_AWAY",
				1002: "CLOSE_PROTOCOL ERROR",
				1003: "CLOSE_UNSUPPORTED",
				1004: "RESERVED",
				1005: "CLOSE_NO_STATUS",
				1006: "CLOSE_ABNORMAL",
				1007: "Unsupported data",
				1008: "Policy violation",
				1009: "CLOSE_TOO_LARGE",
				1010: "Missing Extension",
				1011: "Internal Error",
				1012: "Service Restart",
				1013: "Try Again Later",
				1014: "RESERVED",
				1015: "TLS Handshake failure",
				4000: "Discord: Unknown Error",
				4001: "Discoed: Unknown Opcode",
				4002: "Discoed: Decode Error",
				4003: "Discord: Not Authenticated",
				4004: "Discord: Authentication Failed",
				4005: "Discord: Already Authenticated",
				4007: "Discord: Invalid Sequence",
				4008: "Discord: Rate Limited",
				4009: "Discord: Session Timeout",
				4010: "Discord: Invalid Shard",
				4011: "Discord: Sharding Required"
			};

            bot.util.PERMISSIONS = {
				// General
				createInstantInvite: 0x1,
				kickMembers: 0x2,
				banMembers: 0x4,
				administrator: 0x8,
				manageChannels: 0x10,
				manageServer: 0x20,
				addReactions: 0x40,
				viewAuditLogs: 0x80,
				manageRoles: 0x10000000,
				changeNickname: 0x4000000,
				manageNicknames: 0x8000000,
				manageEmojis: 0x40000000,
				manageWebhooks: 0x20000000,
				// Text
				readMessages: 0x400,
				sendMessages: 0x800,
				sendTTSMessages: 0x1000,
				manageMessages: 0x2000,
				embedLinks: 0x4000,
				attachFiles: 0x8000,
				readMessageHistory: 0x10000,
				mentionEveryone: 0x20000,
				useExternalEmojis: 0x40000,
				// Voice
				voiceConnect: 0x100000,
				voiceSpeak: 0x200000,
				voiceMuteMembers: 0x400000,
				voiceDeafenMembers: 0x800000,
				voiceMoveMembers: 0x1000000,
				voiceUseVAD: 0x2000000
			};

            bot.util.hasPermission = async function(channelID, memberID, permission){
            	return new Promise(async function(fulfill, reject){
            		try{
            			bot.channelCache[channelID] = null;
            			var channel = await bot.receiver.getChannelInfo(channelID);
            			if(channel && channel.permissions.user[memberID]){
							if((channel.permissions.user[memberID].allow & permission) != 0){
								fulfill(true);
								return;
							}else if((channel.permissions.user[memberID].deny & permission) != 0){
								fulfill(false);
								return;
							}
						}else if(!channel){
            				bot.warn("Permissions requested in channel that doesn't exist... "+channelID);
            				fulfill(true);
            				return;
						}
						bot.serverCache[channel.guild_id] = null;
						var server = await bot.receiver.getServerInfo(channel.guild_id);
						async.each(server.members, function(member, cb){
							if(member.id == memberID){
								cb(member);
							}
						}, function(member){
							async.eachSeries(member.roles, function(roleID, cb){
								const role = server.roles[roleID];
								if((role._permissions & permission) != 0){
									console.log("Permission found");
									if(channel && channel.permissions.role[roleID] && (channel.permissions.role[roleID].deny & permission) != 0){
										console.log("Permission override");
										cb();
									}else{
										cb(true);
									}
								}else{
									console.log(`${role._permissions} & ${permission} = ${role._permissions & permission}`);
									if(channel && channel.permissions.role[roleID] && (channel.permissions.role[roleID].allow & permission) != 0){
										cb(true);
									}else{
										console.log("Permission denied");
										cb();
									}
								}
							}, function(hasPermission){
								fulfill(hasPermission || false);
							});
						});
					}catch(e){
            			reject(e);
            			bot.raven.captureException(e);
					}
				});
			};

            bot.util.emojiLookup = async function(name){
            	name = name.toLowerCase();
            	return new Promise(function(fulfill, reject){
            		var output = [];
					async.eachSeries(bot.serverCache, function(server, cb){
						if(server && server.emojis){
							for(var emojiID in server.emojis){
								if(server.emojis.hasOwnProperty(emojiID)){
									var emoji = server.emojis[emojiID];
									if(emoji.name.toLowerCase().indexOf(name) > -1){
										output.push(`<:${emoji.name}:${emoji.id}>`);
									}
								}
							}
						}
						cb();
					}, function(){
						fulfill(output);
					});
				});
			};

            bot.util.arrayDiff = function(first, second) {
                return first.filter(function(i) {return second.indexOf(i) < 0;});
            };

            /**
             * Chooses a random object from `array`
             * @param {Array} array
             * @returns {*} A random object from the specified array
             */
            bot.util.arrayRand = function arrayRand(array){
                return array[Math.round(Math.random()*(array.length-1))];
            };

            bot.util.shuffle = function shuffle(a) {
                var j, x, i;
                for (i = a.length; i; i--) {
                    j = Math.floor(Math.random() * i);
                    x = a[i - 1];
                    a[i - 1] = a[j];
                    a[j] = x
                }
            };

            bot.util.after = function after(time, func){
                return function(err, resp){
                    // var args = arguments;
                    setTimeout(function(){
                        func(err, resp);
                    }, time);
                };
            };

            bot.util.setLongTimeout = function setLongTimeout(callback, timeout_ms){
                if(timeout_ms > 2147483646){
                    setTimeout(function(){
                        setLongTimeout(callback, (timeout_ms - 2147483646));
                    },2147483646);
                }
                else{
                    setTimeout(callback, timeout_ms);
                }
            };


            /**
             * Parses a number into a human readable format
             * @param {number} x
             * @returns {string}
             */
            bot.util.numberWithCommas = function numberWithCommas(x){
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };



            bot.util.quantify = function quantify(data, unit, value) {
                if (value && value >= 1) {
                    if (value > 1 || value < -1)
                        unit += 's';

                    data.push(value + ' ' + unit);
                }

                return data;
            };

            /**
             * Parses a number of seconds as a proper time
             * @param {number} seconds
             * @returns {string}
             */
            bot.util.prettySeconds = function prettySeconds(seconds) {

                var prettyString = '',
                    data = [];

                if (typeof seconds === 'number') {

                    data = bot.util.quantify(data, 'year',   Math.round(seconds / 31556926));
                    data = bot.util.quantify(data, 'day',    parseInt((seconds % 31556926) / 86400));
                    data = bot.util.quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
                    data = bot.util.quantify(data, 'minute', parseInt((seconds % 3600) / 60));
                    data = bot.util.quantify(data, 'second', Math.floor(seconds % 60));

                    var length = data.length,
                        i;

                    for (i = 0; i < length; i++) {

                        if (prettyString.length > 0)
                            if (i == length - 1)
                                prettyString += ' and ';
                            else
                                prettyString += ', ';

                        prettyString += data[i];
                    }
                }

                return prettyString;
            };

            bot.util.debounce = function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this
                        , args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate)
                            func.apply(context, args)
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow)
                        func.apply(context, args)
                }
            };

            bot.util.throttle = function throttle(fn, threshhold, scope) {
                threshhold || (threshhold = 250);
                var last, deferTimer;
                return function() {
                    var context = scope || this;
                    var now = +new Date
                        , args = arguments;
                    if (last && now < last + threshhold) {
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(function() {
                            last = now;
                            fn.apply(context, args)
                        }, threshhold)
                    } else {
                        last = now;
                        fn.apply(context, args)
                    }
                }
            };

            bot.util.searchCache = function (moduleName, callback) {
                // Resolve the module identified by the specified name
                var mod = require.resolve(moduleName);

                // Check if the module has been resolved and found within
                // the cache
                if (mod && ((mod = require.cache[mod]) !== undefined)) {
                    // Recursively go over the results
                    (function run(mod) {
                        // Go over each of the module's children and
                        // run over it
                        mod.children.forEach(function (child) {
                            run(child);
                        });

                        // Call the specified callback providing the
                        // found module
                        callback(mod);
                    })(mod);
                }
            };

            bot.util.uncache = function uncache(moduleName, cb) {
                // Run over the cache looking for the files
                // loaded by the specified module name
                bot.util.searchCache(moduleName, function (mod) {
                    delete require.cache[mod.id];
                    if(cb)
                        cb();
                });

                // Remove cached paths to the module.
                // Thanks to @bentael for pointing this out.
                Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
                    if (cacheKey.indexOf(moduleName)>0) {
                        delete module.constructor._pathCache[cacheKey];
                    }
                });
            };

			String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
				function () {
					"use strict";
					var str = this.toString();
					if (arguments.length) {
						var t = typeof arguments[0];
						var key;
						var args = ("string" === t || "number" === t) ?
							Array.prototype.slice.call(arguments)
							: arguments[0];

						for (key in args) {
							str = str.replace(new RegExp("\\{{" + key + "\\}}", "gi"), args[key]);
						}
					}

					return str;
				};


            cb();
        }
    }
};