/**
 * Created by Peter on 19/04/2016.
 */


var async = require('async');
var sargs = {
    eval: function(user, userID, channel, args, message, bot){
        //if(userID === "U1DNDKZDW" || userID === "U232Q4WQJ"){
        //    bot.sendMessage({
        //        to: channel,
        //        message: "lol no"
        //    });
        //    return true;
        //}
        eval(args.slice(2).join(" "));
        bot.sendMessage({
            to: channel,
            message: "Executed."
        });
    },
    evalOutput: function(user, userID, channel, args, message, bot){
        //if(userID === "U1DNDKZDW" || userID === "U232Q4WQJ"){
        //    bot.sendMessage({
        //        to: channel,
        //        message: "lol no"
        //    });
        //    return true;
        //}
        bot.sendMessage({
            to: channel,
            message:  eval(args.slice(2).join(" "))
        });
    },
    channelInfo: function(user, userID, channel, args, message, bot){
        var targetChannel = bot.channels[args[2]];
        var server = bot.servers[targetChannel.guild_id];
        bot.sendMessage({
            to: channel,
            message: `Channel **${targetChannel.name}** belongs to **${server.name}**`
        })
    },
    servers: function(user, userID, channel, args, message, bot){
        var output = "";
        for(var i in bot.servers){
            var name = bot.servers[i].name;
            if(output.length +name.length+1 >= 1000){
                bot.sendMessage({
                    to: channel,
                    message: output
                });
                output = name;
            }else{
                output += "\n"+name;
            }
        }
        bot.sendMessage({
            to: channel,
            message: output
        });
    },
    ban: function(user, userID, channel, args, message, bot){
        var ban = args[2].replace(/[@<>!]/g, "");
        bot.bannedUsers.push(ban);
        bot.sendMessage({
          to: channel,
          message: ":wave: Bye Bye <@"+ban+">"
        });
    },
    banChannel: function(user, userID, channel, args, message, bot){
        var ban = args[2].replace(/[#<>!]/g, "");
        bot.bannedChannels.push(ban);
        bot.sendMessage({
            to: channel,
            message: ":wave: Bye Bye <#"+ban+">"
        });
    },
    createInvite: function(user, userID, channel, args, message, bot){
        bot.createInvite({
            channelID: args[2],
            max_users: 1,
            max_age: 60
        }, function(err, resp){
            if(err) {
                bot.sendMessage({
                    to: channel,
                    message: "Unable to create invite. "+err.message
                })
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "http://discord.gg/"+resp.code
                });
            }
        });
    },
    deleteInvite: function(user, userID, channel, args, message, bot){
        bot.deleteInvite(args[2], function(err){
            bot.sendMessage({
                to: channel,
                message: err ? "Error deleting invite: "+err : "Deleted successfully"
            });
        })
    },
    botFarms: function(user, userID, channel, args, message, bot){
        var data = {};
        for(var serverID in bot.servers){
            var server = bot.servers[serverID];
            data[serverID] = {
                name: server.name,
                bots: 0,
                users: 0,
                total: server.member_count
            };
            for(var memberID in server.members){
                if(bot.users[memberID].bot){
                    data[serverID].bots++;
                }else{
                    data[serverID].users++;
                }
            }
        }

        setTimeout(function(){
            var output = "**Potential Bot Farms:**\n";

            var outputs = [];

            for(var serverID in data){
                var server = data[serverID];
                var ratio = server.bots/server.users;
                if(ratio > 20){
                    if(server.bots+server.users !== server.total){
                        //output+= `(MISMATCH ${server.total} members.) **${server.name}** (${serverID}) has **${server.bots} bots** and **${server.users} users**. (${ratio.toFixed(2)} ratio)\n`
                    }else{
                        //outputs.push(serverID);
                        //output+= `**${server.name}** (${serverID}) has **${server.bots} bots** and **${server.users} users**. (${ratio.toFixed(2)} ratio)\n`
                        //
                    }

                }
            }

            async.eachSeries(outputs, function(output, cb){
                var mainChannel = Object.keys(bot.servers[output].channels)[0];
                bot.sendMessage({
                    to: mainChannel,
                    message: "Leaving suspected bot farm due to high ratio of bots to users."
                }, function(){

                    setTimeout(function(){
                        bot.leaveServer(output, function(){
                        setTimeout(cb, 1000);
                    });
                    }, 1000);
                });
            }, function(){
                bot.sendMessage({
                    to: channel,
                    message: "Left "+output.length+" servers"
                });
            });
        }, 1000);



    },
    config: function(user, userID, channel, args, message, bot){
        switch(args[3]){
            default:
                return false;
            case "set":
                if(args.length < 4)return false;
                bot.sendMessage({
                    to: channel,
                    message: `\`config.${args[3]}.${args[4]} = ${args[5]}\``
                });
                bot.config[args[3]][args[4]] = args[5];
                bot.log(`${user} set ${args[3]}.${args[4]} to ${args[5]}`);
                break;
            case "get":
                if (!bot.config[args[3]][args[4]]) {
                    bot.sendMessage({
                        to: channel,
                        message: "Specified config key doesn't exist."
                    });
                } else {
                    bot.sendMessage({
                        to: channel,
                        message: "`config." + args[3] + "." + args[4] + " = " + bot.config[args[3]][args[4]] + "`"
                    });
                }
                break;
            case "save":
                bot.saveConfig(function saveConfig(){
                    bot.log("Configuration saved manually.");
                    bot.sendMessage({
                        to: channel,
                        message: "Saved config."
                    });
                });
                break;
            case "load":
                bot.loadConfig(function loadConfig(){
                    bot.log("Configuration loaded manually.");
                    bot.sendMessage({
                        to: channel,
                        message: "Reloaded config. (Commands with onReady events may not take update without restart)"
                    });
                });
                break;
        }
    },
    addNew: function(user, userID, channel, args, message, bot){
        var location = './' + args[2];
        var newCommand = require(location).command;
        bot.commands[newCommand.name] = newCommand;
        if (newCommand.onReady)
            newCommand.onReady(bot);

        bot.sendMessage({
            to: channel,
            message: "`Loaded command: " + newCommand.name + "`"
        });
    },
    add: function(user, userID, channel, args, message, bot){
        try {
            var location = './' + args[2];
            var newCommand;
            var ranOnce = false;
            require.uncache(location, function () {
                    newCommand = require(location).command;
                    bot.commands[newCommand.name] = newCommand;
                if(!ranOnce) {
                    if (newCommand.onReady)
                        newCommand.onReady(bot);

                    bot.sendMessage({
                        to: channel,
                        message: "`Loaded command: " + newCommand.name + "`"
                    });
                    ranOnce = true;
                }

            });


        } catch (e) {
            bot.sendMessage({
                to: channel,
                message: "`Error loading module " + args[2] + " - " + e + "`"
            });
        }
    },
    service: function(user, userID, channel, args, message, bot){
        switch(args[2]) {
            default:
                return false;
            case "list":
                var output = "*Running Services:*\n_Pre-load Services:_\n";
                for(var i in bot.services.loadBefore)
                    if(bot.services.loadBefore.hasOwnProperty(i))
                        output += i+". "+(bot.services.loadBefore[i].name || "Legacy Service")+"\n";
                output+= "_Post-load Services:_\n";
                for(i in bot.services.loadAfter)
                    if(bot.services.loadAfter.hasOwnProperty(i))
                        output += i+". "+(bot.services.loadAfter[i].name || "Legacy Service")+"\n";
                bot.sendMessage({
                	to: channel,
                	message: output
                });
                break;
            case "add":
                try {
                    var location = './../' + args[3];
                    var newService;
                    var ranOnce = false;
                    require.uncache(location, function () {
                        if(!ranOnce){
                            newService = require(location)(bot);
                            bot.services.loadAfter.push(newService);
                            bot.sendMessage({
                                to: channel,
                                message: "Loading service: `" + newService.name + "`..."
                            });
                            newService.init(function(){
                                bot.sendMessage({
                                    to: channel,
                                    message: "Loaded service: `" + newService.name + "`"
                                });
                            });
                            ranOnce = true
                        }
                    });
                } catch (e) {
                    bot.sendMessage({
                        to: channel,
                        message: "`Error loading service " + args[2] + " - " + e + "`"
                    });
                }
                break;
            case "restart":
                if(!args[3]) {
                    bot.sendMessage({
                        to: channel,
                        message: "!msg service restart [id] [loadBefore/loadAfter]"
                    });
                }else {
                    if(bot.services[args[4]][args[3]]) {
                        bot.services[args[4]][args[3]].init(function(){
                           bot.sendMessage({
                           	to: channel,
                           	message: "Done (Like my motivation to continue writing this command)"
                           });
                        });
                    }else {
                        bot.sendMessage({
                        	to: channel,
                        	message: "Service not found."
                        });
                    }

                }
                break;
        }
    },
    handler: function(user, userID, channel, args, message, bot){

    }
};

exports.command = {
    name: "mgt",
    desc: "Management command",
    usage: "mgt "+Object.keys(sargs).join("/"),
    func: function(user, userID, channel, args, message, bot){
        if(bot.isDiscord && userID !== "139871249567318017"){
            bot.sendMessage({
                to: channel,
                message: "Nice try."
            });
            return true;
        }else{
            return sargs[args[1]] ? (sargs[args[1]](user, userID, channel, args, message, bot) || true) : false;
        }
    }
};

require.searchCache = function (moduleName, callback) {
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

require.uncache = function uncache(moduleName, cb) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
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
}