/**
 * Created by Peter on 07/07/2016.
 */
var r = require('rethinkdb');
module.exports = function logging(bot){
    var userList = {};
    return {
        init: function init(){
            bot.log("Initialising message logging...");

            bot.web.users.list(function getUserList(err, list){
                if(err || !list.ok){
                    bot.log("Error getting user list: "+err)
                }else{
                    for(var i in list.members){
                        if(list.members.hasOwnProperty(i)){
                            var user = list.members[i];
                            if(!user.deleted){
                                userList[user.id] = user.name;
                            }
                        }
                    }
                }
            });

            bot.log(JSON.stringify(userList));

            bot.registerMessageHandler("logging", function logMessages(message, channelID, user, userID){
                var messageObj = {channel: channelID, user: userList[userID], message: message, time: new Date().getTime()};
                r.db('ocelotbot').table('messages').insert(messageObj).run(bot.rconnection, function logMessageQuery(err){
                    if(err){
                        bot.log("Error logging message: "+err);
                    }
                })
            });
        },

        userList: userList
    };
};