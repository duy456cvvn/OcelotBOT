/*
* Copyright Ocelotworks 2016 - I should be doing homework right now
 */
exports.command = {
    name: "status",
    desc: "Ocelotworks Service Status",
    usage: "status",
    func: function(user, userID, channel, args, message, bot){

        var output = "*Service Status:*\n";
        var statusMonitor = bot.services.loadAfter[4]; //Kekkity kek
        if(statusMonitor){
            for(var i in statusMonitor.errors)
                if(statusMonitor.errors.hasOwnProperty(i))
                    output += i+": "+(statusMonitor.errors[i].length == 0 ? "no" : statusMonitor.errors[i].length)+" errors\n"
        }

        output += "RethinkDB: "+(bot.rconnection ? "Connected" : "*NOT CONNECTED*")+"\n";
        output += "MySQL: "+(bot.connection ? "Connected" : "*NOT CONNECTED*")+"\n";

        bot.sendMessage({
        	to: channel,
        	message: output
        });
        return true;
    }
};