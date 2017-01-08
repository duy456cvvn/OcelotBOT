/**
 * Created by Peter on 07/07/2016.
 */

var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

module.exports = function(bot) {
    var userList = {};
    return {
        name: 'Message Logging',
        init: function(callback) {
            bot.log('Initializing message logging...');

            bot.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function(data) {
                bot.web.users.list(function(err, list) {
                    if (err || !list.ok) {
                        bot.error(`Error getting user list: ${err}`);
                    } else {
                        for(var i in list.members) {
                            if(list.members.hasOwnProperty(i)) {
                                var user = list.members[i];
                                if(!user.deleted) {
                                    userList[user.id] = user.name;
                                }
                            }
                        }
                        bot.log('Aquired user list.');
                    }
                });
            });


            bot.registerMessageHandler('logging', function(message, channelID, user, userID) {
                if(userID) {
                    var userInList = (userID in userList),
                        args = [
                            channelID,
                            userInList ? userList[userID] : userID,
                            message,
                            new Date().getTime()
                        ];

                    bot.connection.query('INSERT INTO Messages (channel, user, message, time) VALUES (?, ?, ?, ?)', args, function(err, result) {
                        if(err) {
                            bot.error(`Error logging message: ${err}`);
                        }

                        if(!userInList) {
                            bot.warn(`WARNING: ${userID} has no attached username. (${message})`);
                        }
                    });
                }
            });

            if(callback) {
                callback();
            }
        },

        userList: userList
    };
};