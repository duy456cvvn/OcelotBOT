/**
 * Created by Peter on 07/06/2017.
 */
const fs = require('fs');
const async = require('async');
module.exports = function(bot){
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
                async.eachSeries(result, function(ban){
                    bot.banCache[ban.type].push(ban.id);
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


        bot.registerMessageHandler("commands", function(user, userID, channelID, message, event, _bot, receiver){
            try {
                receiver.getServerFromChannel(channelID, function(err, server){
                    if ((bot.prefixCache[server] && message.startsWith(bot.prefixCache[server])) || (!bot.prefixCache[server] && message.startsWith("!"))) {
                        var args = message.split(" ");
                        var command = bot.commands[args[0].substring(bot.prefixCache[server]? bot.prefixCache[server].length : 1)];
                        if (bot.banCache.server.indexOf(server) === -1 &&
                            bot.banCache.channel.indexOf(channelID) === -1 &&
                            bot.banCache.user.indexOf(userID) === -1 &&
                            command) {
                            bot.commandCount++;
                            command(user, userID, channelID, message, args, event, bot, receiver, message.indexOf("-DEBUG") > -1, server);
                            bot.database.logCommand(userID, channelID, message)
                                .then(function(){
                                    bot.log(`${user} (${userID}) in ${server} performed command ${message}`);
                                })
                                .catch(function(err){
                                    bot.error(`Error logging command: ${err.stack}`);
                                });
                        }
                    }

                });

            }catch(e){
                receiver.sendMessage({
                    to: channelID,
                    message: ":bangbang: Command failed: "+e
                });
                bot.error(`Command ${message} failed: ${e}`);
                bot.error(e.stack);
            }
        });
      }
  }
};