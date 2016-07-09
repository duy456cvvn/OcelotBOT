/**
 * Created by Peter on 07/07/2016.
 */
var fs = require('fs');
module.exports = function(bot){
    return {
        init: function initCommands(cb){
            bot.commands = {};
            bot.failedModules = 0;
            bot.log("Loading commands...");
            //Reads the /commands directory, and loads exports.command of each file
            var files = fs.readdirSync(bot.config.misc.commandsDir);
            for (var i in files) {
                if(files.hasOwnProperty(i)){
                    if(!fs.lstatSync('./'+bot.config.misc.commandsDir+'/'+files[i]).isDirectory()){
                        try {
                            var newCommand = require('./' + bot.config.misc.commandsDir + '/' + files[i]).command;
                            bot.log("Loaded command: " + newCommand.name);
                            bot.commands[newCommand.name] = newCommand;

                            if(newCommand.onReady){
                                bot.log("Performed start-up tasks for "+newCommand.name);
                                newCommand.onReady(bot);
                            }
                        }catch(e){
                            bot.error("Error loading module "+files[i]+" - "+e);
                            bot.error(e);
                            bot.failedModules++;
                        }
                    }
                }
            }

            bot.registerMessageHandler("command", function handleCommand(message, channelID, user, userID){
                if (message.startsWith(bot.config.misc.commandPrefix)) {
                    var args = message.split(" ");
                    var command = args[0].replace(bot.config.misc.commandPrefix, "").toLowerCase();
                    if (bot.commands[command]) {
                        try {
                            if (!bot.commands[command].func(user, userID, channelID, args, message, bot)) {
                                bot.sendMessage({
                                    to: channelID,
                                    message: "*Invalid Usage:*\n!" + bot.commands[command].usage
                                });
                            }
                        } catch (e) {
                            bot.sendMessage({to: channelID, message: "Error performing command: " + e.toString()});
                        }
                    }
                }
            });

            if(cb)
                cb();
        }
    }
};