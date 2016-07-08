/**
 * Created by Peter on 06/07/2016.
 */
var mysql = require('mysql');
var rethinkdb = require('rethinkdb');
module.exports = function database(bot){
    return {
        init: function databaseInit(cb) {
            rethinkdb.connect(bot.config.rethinkdb,
            function rethinkDbConnect(err, connection){
                if(err){
                    bot.log("Error connecting to rethinkdb: "+err);
                }else{
                    bot.log("Connected to rethinkdb");
                    bot.rconnection = connection;
                }

                connection.addListener('error', function rethinkdbError(e){
                    bot.log("Error: "+e);
                    setTimeout(function reconnect(){
                        connection.reconnect({noReplyWait: false}, function(err){
                           if(err){
                               bot.log("Error reconnecting... Trying again in 3 seconds.");
                               setTimeout(reconnect, 3000);
                           }
                        });
                    }, 500);
                });

                connection.addListener('close', function(){
                    bot.log("Rethinkdb connection closed.");
                    setTimeout(function reconnect(){
                        connection.reconnect({noReplyWait: false},function(err){
                            if(err){
                                bot.log("Error reconnecting... Trying again in 3 seconds.");
                                setTimeout(reconnect, 3000);
                            }
                        });
                    }, 500);
                });


            });

            bot.connection = mysql.createConnection(bot.config.database);

            bot.connection.on('error', function mysqlErrorEvent(err) {
                bot.log("MySQL Error: " + err);
                bot.log(err);
                setTimeout(bot.mysqlConnect, 3000);
            });

            bot.connection.on('disconnected', function mysqlDisconnectEvent() {
                bot.log("MySQL Disconnected");
                setTimeout(bot.mysqlConnect, 3000);
            });


            bot.mysqlConnect = function mysqlConnect(){
                try {
                    bot.connection.connect(function mySqlConnect(err) {
                        if (err) {
                            bot.log('Error connecting: ' + err);
                            if (cb)
                                cb();
                            setTimeout(bot.mysqlConnect, 3000);
                        }
                        else {
                            bot.log("Connected to MySQL");
                            if (cb)
                                cb();
                        }

                    });
                } catch (e) {
                    bot.log("Exception connecting to MySQL: " + e);
                    setTimeout(bot.mysqlConnect, 3000);
                }
            };

            bot.mysqlConnect();


        }
    }
};