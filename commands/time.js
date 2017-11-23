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
            timeFormat = 'MMMM Do, YYYY HH:mm:ss ZZ',
            now = timezone ? m.tz(timezone) : m,
            emoji = `:clock${now.format("h")}${(now.get("m") >= 30) ? "30" : ""}:`;

            if(now.format("hh:mm") == "04:20")emoji = ":weed:";

        if(now.format("hh:mm") == "05:05") {
            bot.sendMessage({
                to: channel,
                message: `${emoji} I'm going back to *${now.format(timeFormat)}* whether it's a 7 hour flight or a 45 minute drive.`
            });
        }else if(now.format("hh:mm") == "09:11"){
            bot.sendMessage({
                to: channel,
                message: `:airplane_arriving: :office: :office: The time is *${now.format(timeFormat)}*`
            });
        }else{
            bot.sendMessage({
                to: channel,
                message: `${emoji} The time is *${now.format(timeFormat)}*`
            });
        }


        return true;
    },
    test: function(test){
        test.todo("timezones test");
        test.cb('time no arguments', function(t){
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("The time is") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["time"], "", bot));
        });
    }
};

