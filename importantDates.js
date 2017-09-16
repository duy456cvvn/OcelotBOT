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
                    var hasYear = yearRegex.exec(message);
                    var year = hasYear ? hasYear[0] : null;
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


            bot.connection.query('SELECT COUNT(*) FROM Messages', function(err, result) {
                if(result && result[0] && result[0]["COUNT(*)"]){
                    bot.log("Got message count of "+result[0]["COUNT(*)"]);
                    var messageCount = result[0]["COUNT(*)"];
                    bot.registerMessageHandler("Message milestone counter", function(message, channelID, user, userID) {
                       messageCount++;
                       if(messageCount == 300000){
                           bot.sendMessage({
                               to: channelID,
                               message: ":tada: :tada: :tada: Congratulations "+user+", you just sent the *300,000th Message!* :tada: :tada: :tada:\n"+
                                        "I hope that _'"+message+"'_ is a message you are proud of."
                           });
                       }
                    });
                }else{
                    bot.log(err);
                }
            });

        }
    }
};