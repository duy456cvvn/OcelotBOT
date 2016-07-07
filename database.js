/**
 * Created by Peter on 06/07/2016.
 */
var mysql = require('mysql');

module.exports = function database(bot){
    return {
        init: function databaseInit(cb) {
            bot.connection = mysql.createConnection(bot.config.database);

            bot.connection.on('error', function mysqlErrorEvent(err) {
                bot.log("MySQL Error: " + err);
                bot.log(err);
                setTimeout(mysqlInit, 3000);
            });

            bot.connection.on('disconnected', function mysqlDisconnectEvent() {
                bot.log("MySQL Disconnected");
                setTimeout(mysqlInit, 3000);
            });

            try {
                bot.connection.connect(function mySqlConnect(err) {
                    if (err) {
                        bot.log('Error connecting: ' + err);
                        if (cb)
                            cb();
                        setTimeout(mysqlInit, 3000);
                    }
                    else {
                        bot.log("Connected to MySQL");
                        if (cb)
                            cb();
                    }

                });
            } catch (e) {
                bot.log("Exception connecting to MySQL: " + e);
                setTimeout(mysqlInit, 3000);
            }
        }
    }
};