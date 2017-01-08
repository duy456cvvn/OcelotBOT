/**
 * Created by Peter on 08/07/2016.
 */
var dateformat = require('dateformat');
var mysql = require('mysql');

exports.command = {
    name: "quote",
    desc: "Get a random quote by a user",
    usage: "quote <username> [filter]",
    func: function(user, userID, channel, args, message, bot) {

        if(args.length < 2) {
            return false;
        }

        var username = args[1];
        if(args[2]) {
            var sentence = message.substring(message.indexOf(args[2]));
            bot.connection.query(`SELECT * FROM Messages WHERE user = ? AND message REGEXP "\\b${mysql.escape(sentence)}\\b" ORDER BY RAND() LIMIT 1`, [username], function(err, result) {
                if(err) {
                    bot.sendMessage({
                        to: channel,
                        message: `Error: ${err}`
                    });
                } else {
                    if(result.length > 0 && result[0].message) {
                        var row = result[0],
                            date = dateformat(new Date(row.time), 'dd/mm/yy');

                        bot.sendMessage({
                            to: channel,
                            message: `>[${date}] <${row.user}> ${row.message}`
                        });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: 'Nothing found'
                        });
                    }
                }
            });
        } else {
            bot.connection.query('SELECT * FROM Messages WHERE user = ? ORDER BY RAND() LIMIT 1', [username], function(err, result) {
                if(err) {
                    bot.sendMessage({
                        to: channel,
                        message: `Error: ${err}`
                    });
                } else {
                    if(result.length > 0 && result[0].message) {
                        var row = result[0],
                            date = dateformat(new Date(row.time), 'dd/mm/yy');
                            
                            bot.sendMessage({
                                to: channel,
                                message: `>[${date}] <${row.user}> ${row.message}`
                            });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: 'Nothing found'
                        });
                    }
                }
            });
        }

        return true;
    }
};

