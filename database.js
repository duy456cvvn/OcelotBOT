/**
 * Created by Peter on 06/07/2016.
 */
var mysql = require('mysql');
var rethinkdb = require('rethinkdb');
module.exports = function database(bot){


    var databaseObject = {

        mysqlErrorHandler: function mysqlError(err){
            databaseObject.mysqlRetries++;
            bot.error("MySQL Error:" +err+" trying again in "+(3+databaseObject.mysqlRetries)+" seconds...");
            setTimeout(databaseObject.mysqlConnect, 3000+(databaseObject.mysqlRetries*1000));

        },

        mysqlDisconnectHandler: function mysqlDisconnect(){
            databaseObject.mysqlRetries++;
            bot.error("Disconnected from MySQL: reconnecting in "+(3+databaseObject.mysqlRetries)+" seconds...");
            setTimeout(databaseObject.mysqlConnect, 3000+(databaseObject.mysqlRetries*1000));
        },

        mysqlConnectHandler: function mysqlConnected(err){
            if (err) {
                databaseObject.mysqlRetries++;
                bot.error('Error connecting: ' + err+" trying again in "+(3+databaseObject.mysqlRetries)+" seconds...");
                setTimeout(databaseObject.mysqlConnect, 3000+(databaseObject.mysqlRetries*1000));
            }
            else {
                bot.log("Connected to MySQL");
                bot.connection.query("USE stevie", function(){});
                databaseObject.mysqlRetries = 0;
            }
        },

        mysqlRetries: 0,

        mysqlConnect: function mysqlConnect(cb){
            try {
                bot.connection = mysql.createConnection(bot.config.database);

                bot.connection.on('error', databaseObject.mysqlErrorHandler);
                bot.connection.on('disconnected', databaseObject.mysqlDisconnectHandler);

                bot.connection.connect(databaseObject.mysqlConnectHandler);

                if(cb)
                    cb();
            } catch (e) {
                databaseObject.mysqlRetries++;
                bot.error("Exception connecting: " +e+" trying again in "+(3+databaseObject.mysqlRetries)+" seconds...");
                setTimeout(databaseObject.mysqlConnect, 3000+(databaseObject.mysqlRetries*1000));
            }
        },

        rethinkErrorHandler: function rethinkError(err){
            bot.error("Error: "+e);
            setTimeout(databaseObject.rethinkReconnect, 500);
        },

        rethinkDisconnectHandler: function rethinkDisconnect(){
            bot.error("Rethinkdb connection closed.");
            setTimeout(databaseObject.rethinkReconnect, 500);
        },

        rethinkRetries: 0,
        rethinkReconnect: function rethinkReconnect(){
            connection.reconnect({noReplyWait: false}, function(err){
                if(err){
                    databaseObject.rethinkRetries++;
                    bot.error("Error reconnecting... Trying again in "+(3+databaseObject.rethinkRetries)+" seconds.");
                    setTimeout(databaseObject.rethinkReconnect, 3000+(databaseObject.rethinkRetries*1000));
                }
            });
        },
        name: "Database Manager",
        init: function databaseInit(cb) {
            databaseObject.mysqlConnect(function(){
                rethinkdb.connect(bot.config.rethinkdb,
                    function rethinkDbConnect(err, connection){
                        if(err){
                            bot.error("Error connecting to rethinkdb: "+err);
                            bot.failedModules++;
                        }else{
                            bot.log("Connected to rethinkdb");
                            bot.rconnection = connection;
                            connection.addListener('error', databaseObject.rethinkErrorHandler);
                            connection.addListener('close', databaseObject.rethinkDisconnectHandler);
                            if(cb)
                                cb();
                        }
                    });
            });
        }
    };

    return databaseObject;
};


