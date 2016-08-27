/**
 * Created by Peter on 07/07/2016.
 */
var CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS;
module.exports = function(bot){
    return{
        name: "Important Date Checker",
        init: function checkImportantDates(cb){
            bot.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function rtmOpenEvent(data){
                var date = new Date();
                if(bot.config.importantDates[date.getDate()+"/"+date.getMonth()]){
                    bot.sendMessage({
                        to: bot.config.misc.mainChannel,
                        message: bot.config.importantDates[date.getDate()+"/"+date.getMonth()]
                    });
                }else{
                    bot.log("No important dates today.");
                }
                setTimeout(checkImportantDates,  8.64e7); //24 hours
                if(cb)
                    cb();
            });

        }
    }
};