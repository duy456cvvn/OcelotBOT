/**
 * Created by Peter on 07/06/2017.
 */
module.exports = {
    name: "Help Command",
    usage: "help [command]",
    accessLevel: 0,
    commands: ["help", "commands"],
    run: function run(user, userID, channel, message, args, event, bot, recv){
       var output = "COMMANDS:\n";
        recv.getServerFromChannel(channel, function(err, server){
            for(var i in bot.commandUsages){
                if(bot.commandUsages.hasOwnProperty(i) && !bot.commandUsages[i].hidden && (!bot.commandUsages[i].receivers || bot.commandUsages[i].receivers.indexOf(recv.id) > -1))
                    output += `**${i}** - ${bot.prefixCache[server] || "!"}${bot.commandUsages[i].usage}\n`
            }

            recv.sendMessage({
                to: channel,
                message: output
            });
        });


    }
};