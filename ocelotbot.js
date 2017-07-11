/**
 * Created by Peter on 07/06/2017.
 */
const   config      = require('config'),
        async       = require('async'),
        path        = require('path'),
        ipc         = require('node-ipc'),
        logger      = require('ocelot-logger');

var bot = {};

function initBot(cb){

    bot.wasConnected = false;
    bot.errorCount = 0;
    bot.commandCount = 0;
    bot.lastCrash = new Date();
    bot.message = "v4 released!";

    bot.log = logger.log;
    bot.error = logger.error;
    bot.warn = logger.warn;

    bot.log("OcelotBOT Loading...");

    bot.messageHandlers = {};

    bot.registerMessageHandler = function registerMessageHandler(name, func){
        bot.messageHandlers[name] = func;
        bot.log(`Registered message handler ${name}`);
    };

    bot.receiveMessage = function receiveMessage(user, userID, channelID, message, event){
        for(var i in bot.messageHandlers){
            if(bot.messageHandlers.hasOwnProperty(i)){
                bot.messageHandlers[i](user, userID, channelID, message, event, bot, bot.receiver);
            }
        }
    };

    bot.loadBefore = config.get("Modules.LoadBefore");
    bot.loadAfter = config.get("Modules.LoadAfter");

    initModules(bot.loadBefore, function initLoadBefore() {
        bot.log("Done.");
    });

    cb();
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
