/**
 * Created by Peter on 2/7/216.
 */
var moment = require("moment-timezone");
exports.command = {
    name: "time",
    desc: "The time ime",
    usage: "time <timezone>",
    func: function(user, userID, channel, args, message, bot){
        var m = moment(),
            timezone = args[1],
            now = timezone ? m.tz(timezone) : m,
            emoji = `:clock${now.format("h")}${(now.get("m") >= 30) ? "30" : ""}:`;

        bot.sendMessage({
        	to: channel,
        	message: `${emoji} The time is *${now.format("HH:mm:ss YYYY-MM-DD z")}*`
        });

        return true;
    }
};

