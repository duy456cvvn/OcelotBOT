/**
 * Created by Peter on 07/07/2016.
 */
var CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS;
var yearRegex = /%[0-9]{4}/;
module.exports = function(bot){
    return{
        name: "Important Date Checker",
        init: function checkImportantDates(cb){
            bot.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function rtmOpenEvent(data){
                var date = new Date();
                if(bot.config.importantDates[date.getDate()+"/"+(date.getMonth()+1)]){
                    var message = bot.config.importantDates[date.getDate()+"/"+(date.getMonth()+1)];
                    var year = yearRegex.exec(message)[0];
                    if(year)
                        message = message.replace(year, date.getFullYear()-year.substring(1));
                    bot.sendMessage({
                        to: bot.config.misc.mainChannel,
                        message: message
                    });
                }else{
                    bot.log("No important dates today. ("+date.getDate()+"/"+(date.getMonth()+1)+")");
                }
                setTimeout(checkImportantDates,  8.64e7); //24 hours
                if(cb)
                    cb();
            });

        }
    }
};