/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "reloadCommand",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        try {
            bot.util.uncache("../"+args[2], function () {
                var loadedCommand = require("../" + args[2]);
                recv.sendMessage({
                    to: channel,
                    message: `Loaded command ${loadedCommand.name}`
                });
                bot.commandUsages[loadedCommand.name] = {
                    usage: loadedCommand.usage,
                    accessLevel: loadedCommand.accessLevel
                };
                for (var i in loadedCommand.commands) {
                    if (loadedCommand.commands.hasOwnProperty(i)) {
                        bot.commands[loadedCommand.commands[i]] = loadedCommand.run;
                    }

                }
            });
        }catch(e){
            recv.sendMessage({
                to: channel,
                message: e.stack
            });
        }
    }
};