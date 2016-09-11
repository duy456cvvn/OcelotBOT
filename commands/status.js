/*
* Copyright Ocelotworks 2016 - I should be doing homework right now
 */
exports.command = {
    name: "status",
    desc: "Ocelotworks Service Status",
    usage: "status",
    func: function(user, userID, channel, args, message, bot){

        var output = "*Service Status:*\n";
        var statusMonitor = bot.services.loadAfter[3]; //Kekkity kek
        if(statusMonitor){
            for(var i in statusMonitor.errors)
                if(statusMonitor.errors.hasOwnProperty(i))
                    output += (statusMonitor.errors.length > 0 ? ":red_circle: " : ":white_check_mark: ")+i+"\n"
        }

        output += (bot.rconnection  ? ":white_check_mark:" : ":red_circle:")+" RethinkDB\n";
        output += (bot.connection  ? ":white_check_mark:" : ":red_circle:")+" MySQL\n";

        bot.sendMessage({
        	to: channel,
        	message: output
        });
        return true;
    }
};