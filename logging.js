/**
 * Created by Peter on 07/07/2016.
 */
var r = require('rethinkdb');
var CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS;
module.exports = function logging(bot){
    var userList = {};
    return {
        name: "Message Logging",
        init: function init(cb){
            bot.log("Initialising message logging...");

            bot.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function rtmOpenEvent(data) {
                bot.web.users.list(function getUserList(err, list) {
                    if (err || !list.ok) {
                        bot.error("Error getting user list: " + err)
                    } else {
                        for (var i in list.members) {
                            if (list.members.hasOwnProperty(i)) {
                                var user = list.members[i];
                                if (!user.deleted) {
                                    userList[user.id] = user.name;
                                }
                            }
                        }
                        bot.log("Aquired user list.");
                    }
                });
            });


            bot.registerMessageHandler("logging", function logMessages(message, channelID, user, userID){
                if(userID){
                    var messageObj = {channel: channelID, user: userList[userID] ? userList[userID]  : userID , message: message, time: new Date().getTime()};
                    r.db('ocelotbot').table('messages').insert(messageObj).run(bot.rconnection, function logMessageQuery(err){
                        if(err){
                            bot.error("Error logging message: "+err);
                        }

                        if(!userList[userID]){
                            bot.warn("WARNING: "+userID+" has no attached username. ("+message+")");
                        }
                    })
                }
            });

            if(cb)
                cb();
        },

        userList: userList
    };
};