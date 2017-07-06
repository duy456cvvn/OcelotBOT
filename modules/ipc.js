/**
 * Created by Peter on 05/07/2017.
 */

const ipc = require('node-ipc');
const config = require('config');

module.exports = function(bot){
    return {
        name: "Broker Communication Module",
        enabled: true,
        init: function init(cb) {

            bot.waitingCallbacks = {};
            var callbackIDs = 0;
            bot.instance = parseInt(process.argv[2]);

            ipc.config.id = 'ocelotbot-'+bot.instance;
            ipc.config.retry = 1000;
            ipc.config.silent = true;

            const socket = config.get("Broker.socket");

            bot.log(`This is ${ipc.config.id}`);
            cb();

            ipc.connectTo(socket, function ipcConnect(){
                bot.ipc = ipc.of[socket];
                bot.log(`Connecting to ${socket}`);
                bot.ipc.on("connect", function ipcConnected(){
                    bot.log(`Connected to IPC on ${socket}`);
                    bot.ipc.emit('instanceReady', {instance: bot.instance});
                });

                bot.ipc.on("receiveMessage", function(data){
                    data.push(bot);
                    data.push("discord");
                    bot.receiveMessage.apply(this, data)
                });

                bot.ipc.on("callback", function(data){
                    bot.waitingCallbacks[data.id].apply(this, data.args);
                    delete bot.waitingCallbacks[data.id];
                });

                bot.ipc.on('disconnect', function ipcDisconnect(){
                    bot.warn("IPC Disconnected");
                });

                bot.ipc.on('message', function(data){
                    console.log(data);
                });
            });

            var serverCache = {};

            bot.receiver = new Proxy({
                id: "discord",
                getServerFromChannel: function getServerFromChannel(channel, cb){
                    if(serverCache[channel]){
                        cb(null, serverCache[channel]);
                    }else{
                        bot.log(`Populating serverCache for channel ${channel}`);
                        var callbackNumber = callbackIDs++;
                        bot.waitingCallbacks[callbackNumber] = cb;
                        bot.ipc.emit("command", {
                            receiver: "discord",
                            args: Array.from(arguments),
                            command: "getServerFromChannel",
                            callbackID: callbackNumber
                        });
                    }
                }
            }, {
                get: function(target, command){
                    return target[command] || function(){
                        const hasCallback = typeof arguments[arguments.length-1] == "function";
                        if(hasCallback){
                            console.log(command+" HAS CALLBACK!!");
                            var callback = arguments[arguments.length-1];
                            var callbackNumber = callbackIDs++;
                            console.log("CALLBACK NUMBER IS "+callbackNumber);
                            bot.waitingCallbacks[callbackNumber] = callback;
                            delete arguments[arguments.length-1];
                        }
                        bot.ipc.emit("command", {
                            receiver: "discord",
                            args: Array.from(arguments),
                            command: command,
                            callbackID: callbackNumber
                        });
                    }
                }
            });

            process.on('beforeExit', function(){
                console.log("Exiting");
                if(bot.rpc){
                    bot.rpc.emit("instanceDisconnect", {instance: bot.instance});
                }
            });
        }
    }
};