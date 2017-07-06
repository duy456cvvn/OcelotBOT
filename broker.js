/**
 * Created by Peter on 05/07/2017.
 */
const ipc = require('node-ipc');
const config = require('config');
const async = require('async');

var bot = {
    receivers: {}
};

bot.log = console.log;
bot.warn = console.warn;
bot.error = console.error;


bot.availableInstances = [];
bot.totalMessages = 0;

bot.receiveMessage = function(user, userID, channelID, message, event){
    if(bot.availableInstances.length)
        ipc.server.emit(bot.availableInstances[bot.totalMessages++ % bot.availableInstances.length], "receiveMessage", Array.from(arguments));
};

var messageReceivers = config.get("Receivers");
async.eachSeries(messageReceivers, function loadMessageReceiver(file, cb) {
    var messageReceiver = require("./receivers/" + file)(bot);
    if (messageReceiver.init) {
        console.log(`Loading Message Receiver ${messageReceiver.name}`);
        bot.receivers[messageReceiver.id] = messageReceiver;
        bot.receivers[messageReceiver.id].internal = {};
        messageReceiver.init(bot.receivers[messageReceiver.id].internal, cb);

    } else {
        console.warn(`Message Receiver ${file} is invalid/missing 'init' function.`);
    }
}, function finishLoad() {
    console.log("Loaded all message receivers");
});


ipc.config.id = 'ocelotbot';
ipc.config.retry= 1500;
ipc.config.silent = true;

ipc.serve(function(){
    ipc.server.on('instanceReady', function instanceReady(data, socket){
        console.log(`Instance ${data.instance} is ready to receive messages.`);
        bot.availableInstances.push(socket);
        console.log(bot.availableInstances.length);
    });

    ipc.server.on('instanceDisconnect', function instanceDisconnect(data, socket){
        console.log(`Instance ${data.instance} is going down.`);
        bot.availableInstances.splice(bot.availableInstances.indexOf(socket), 1);
        console.log(bot.availableInstances.length);
    });

    ipc.server.on('command', function command(data, socket){
        if(data.callbackID != undefined){
            console.log("Callback ID "+data.callbackID);
            data.args[data.args.length-1] = function(){
                ipc.server.emit(socket, "callback", {
                    id: data.callbackID,
                    args: Array.from(arguments)
                });
            };
        }

        if(bot.receivers[data.receiver] && bot.receivers[data.receiver][data.command]){
            bot.receivers[data.receiver][data.command].apply(this, data.args);
        }else{
            console.warn(`Received unknown function/receiver: ${data.receiver}/${data.command}`);
        }

    });

    ipc.server.on('socket.disconnected', function socketDisconnect(socket, destroyedSocketID){
        console.log(`Socket ${destroyedSocketID} went away.`);
        bot.availableInstances.splice(bot.availableInstances.indexOf(socket), 1);
        console.log(bot.availableInstances.length);

        if(bot.availableInstances.length === 0){
            bot.receivers.discord.sendMessage({
                to: "139871249567318017",
                message: "[BROKER] **No bot instances available to serve requests!**"
            });
        }
    });

});




ipc.server.start();