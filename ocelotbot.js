/**
 * Created by Peter on 07/06/2017.
 */
const   config      = require('config'),
        dateFormat  = require('dateformat'),
        colors      = require('colors'),
        caller_id   = require('caller-id'),
        async       = require('async'),
        path        = require('path');

var bot = {};

function initBot(cb){

    bot.wasConnected = false;
    bot.errorCount = 0;
    bot.commandCount = 0;
    bot.lastCrash = new Date();

    bot.log = function log(message, caller){
        if(!caller)
            caller = caller_id.getData();
        var file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split(path.sep);

        var origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

        var output = origin+message;
        console.log(`[${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`+output);
    };

    bot.error = function error(message){
        bot.log(message.red, caller_id.getData());
        bot.errorCount++;
    };

    bot.warn = function warn(message){
        bot.log(message.yellow, caller_id.getData());
    };

    bot.log("OcelotBOT Loading...");

    bot.messageHandlers = {};

    bot.registerMessageHandler = function registerMessageHandler(name, func){
        bot.messageHandlers[name] = func;
        bot.log(`Registered message handler ${name}`);
    };

    bot.receiveMessage = function receiveMessage(user, userID, channelID, message, event, bot, receiver){
        for(var i in bot.messageHandlers){
            if(bot.messageHandlers.hasOwnProperty(i)){
                bot.messageHandlers[i](user, userID, channelID, message, event, bot, bot.receivers[receiver]);
            }
        }
    };
    bot.receivers = [];
    bot.loadBefore = config.get("Modules.LoadBefore");
    bot.loadAfter = config.get("Modules.LoadAfter");

    initModules(bot.loadBefore, function initLoadBefore() {
        var messageReceivers = config.get("Receivers");
        async.eachSeries(messageReceivers, function loadMessageReceiver(file, cb) {
            var messageReceiver = require("./receivers/" + file)(bot);
            if (messageReceiver.init) {
                bot.log(`Loading Message Receiver ${messageReceiver.name}`);
                bot.receivers[messageReceiver.id] = messageReceiver;
                bot.receivers[messageReceiver.id].internal = {};
                messageReceiver.init(bot.receivers[messageReceiver.id].internal, cb);

            } else {
                bot.warn(`Message Receiver ${file} is invalid/missing 'init' function.`);
            }
        }, function finishLoad() {
            bot.log("Loaded all message receivers");
            initModules(bot.loadAfter, cb);
        });
    });
}

function initModules(modules, cb){
    bot.log(`Loading ${modules.length} modules...`);
    async.eachSeries(modules, function loadModule(module, callback){
        var loadedModule = require('./modules/'+module)(bot);
        bot.log(`Loading ${loadedModule.name}...`);
        loadedModule.init(callback);
    }, cb);
}

initBot(function(){
    bot.log("Ready");
});