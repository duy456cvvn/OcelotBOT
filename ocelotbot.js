/**
 * Created by Peter on 03/06/2016.
 */

var RtmClient       = require('@slack/client').RtmClient,
    WebClient       = require('@slack/client').WebClient,
    CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS,
    RTM_EVENTS      = require('@slack/client').RTM_EVENTS,
    fs              = require('fs'),
    mysql           = require('mysql'),
    simplebus       = require('simplebus'),
    https           = require('https'),
    caller_id       = require('caller-id'),
    async           = require('async');




var year = new Date().getFullYear();

var WS_CLOSE_CODES = {
    1000: "CLOSE_NORMAL",
    1001: "CLOSE_GOING_AWAY",
    1002: "CLOSE_PROTOCOL ERROR",
    1003: "CLOSE_UNSUPPORTED",
    1004: "RESERVED",
    1005: "CLOSE_NO_STATUS",
    1006: "CLOSE_ABNORMAL",
    1007: "Unsupported data",
    1008: "Policy violation",
    1009: "CLOSE_TOO_LARGE",
    1010: "Missing Extension",
    1011: "Internal Error",
    1012: "Service Restart",
    1013: "Try Again Later",
    1014: "RESERVED",
    1015: "TLS Handshake failure"
};

var bot = {};


bot.config = {
    slack:{
        username: "",
        token_b: "",
        token_p: "",
        webhook: "",
        payload_token: "",
        clientId: "",
        clientSecret: "",
        certs: {
            key: "",
            cert: ""
        }
    },
    database: {
        host: "",
        port: 3306,
        user: "",
        password: ""
    },
    topic: {
        threshold: 100,
        file: "topic.dat"
    },
    misc:{
        commandPrefix: "!",
        commandsDir: "commands",
        mainChannel: "",
        logChannel: "",
        logChannelEnabled: false,
        proxyURL: "",
        translateKey: "",
        weatherKey: ""
    },
    petermon:{
        username: "",
        password: "",
        url: ""
    },
    fabric: {
        email: "",
        password: ""
    },
    importantDates:{
        "20/1": "Happy Birthday Steve! 20/1/2014-16/8/2014 (%2014 years ago.)",
        "9/2": "Happy Birthday me! 9/2/2016-FOREVER (%2016 years ago.) Also Happy Birthday Peter!",
        "29/5": "Happy Birthday OcelotBOT 1 29/5/2015-9/2/2016 (%2015 years ago.)",
        "22/7": "Happy Birthday Stevie! 22/7/2014-2/5/2015 (%2014 years ago.)",
        "31/8": "Happy Georgia got fingered day! 31/8/2014 (%2014 years ago.)",
        "7/9": "Happy Birthday Alex!",
        "11/9": "Happy 9/11 guys"
    }
};
bot.messageHandlers = [];
bot.lastCrash = new Date();

//OcelotBOT Modules
var interactiveMessages = require('./interactiveMessages.js')(bot);
var database = require('./database.js')(bot);
var commands = require('./commands.js')(bot);
var autoReplies = require('./autoReplies.js')(bot);
var importantDates = require('./importantDates.js')(bot);


function startBot(){
    bot.log = function(message){
        var caller = caller_id.getData();
        var file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split("/");
        var output = "["+file[file.length-1]+(caller.functionName ? "/"+caller.functionName+"] "+message : "] "+message);
        console.log(output);
        if(bot.config.misc.logChannelEnabled && bot.rtm && bot.rtm.connected){
            bot.sendMessage({
                to: bot.config.misc.logChannel,
                message: output
            });
        }
    };

    bot.interactiveMessages = {};


    async.series([
        loadConfig,
        saveConfig,
        interactiveMessages.init,
        database.init,
        commands.init,
        botInit,
        importantDates.init
    ]);


}

function loadConfig(cb){
    bot.log("Loading configuration file...");
    fs.readFile("config.json", function readConfigFile(err, data){
        if(err){
            bot.log("Could not load configuration file: "+err);
        }else{
            try {
                bot.config = JSON.parse(data);
                bot.log("Configuration loaded successfully");
                //var newConfig = JSON.parse(data);
                //bot.log(newConfig);
                //for(var key in Object.keys(bot.config)){
                //    if(newConfig[key]){
                //        bot.log(key+" = "+newConfig[key]);
                //        bot.config[key] = newConfig[key];
                //    }
                //}
                cb();
            }catch(e){
                bot.log("Config parse error: "+e);
                cb();
            }
        }
    });

}


function saveConfig(cb){
    fs.writeFile("config.json", JSON.stringify(bot.config, null, "  "), function writeConfigFile(err){
        if(err){
            bot.log("Error writing configuration file: "+err);
            cb();
        }else{
            bot.log("Configuration saved successfully.");
            cb();
        }
    });
}

function botInit(cb){

    bot.log("Initialising...");
    bot.rtm = new RtmClient(bot.config.slack.token_b);
    bot.web = new WebClient(bot.config.slack.token_b);
    bot.web_p = new WebClient(bot.config.slack.token_p);

    bot.fireInteractiveMessage = function(callback_id, name, value){
        if(bot.interactiveMessages[callback_id]){
            return bot.interactiveMessages[callback_id](name, value);
        }

        return false;
    };


    bot.sendMessage = function(data, cb){
        if(!data.message || data.message == ""){
            var caller = caller_id.getData();
            var file = caller.filePath ? caller.filePath.split("/") : ["unknown"];
            bot.sendMessage({
                to: data.to,
                message: `*WARNING: ${file[file.length-1]}/${caller.functionName} tried to send a blank or null message.*`
            });
        }else{
            data.message = (""+data.message)
                .replace(bot.config.slack.token_b, "<REDACTED>")
                .replace(bot.config.slack.token_p, "<REDACTED>")
                .replace(bot.config.slack.webhook, "<REDACTED>")
                .replace(bot.config.slack.payload_token, "<REDACTED>")
                .replace(bot.config.slack.clientSecret, "<REDACTED>")
                .replace(bot.config.database.password, "<REDACTED>")
                .replace("undefined", "https://www.youtube.com/watch?v=b7k0a5hYnSI&t=18");

            bot.rtm.sendMessage(data.message, data.to, function sendMessageResult(err, resp){
                if(err){
                   console.log("Error sending message: "+JSON.stringify(err));
                }else if(cb){cb(err, resp)}
            });
        }
    };

    bot.editMessage = function(data, cb){
        bot.web.chat.update(data.messageID, data.channel, data.message, cb ? cb : null)
    };

    /**
     * Sends a message with buttons too
     * @param channel The channel/user to send it to
     * @param text The message to be sent along with the buttons
     * @param fallback The message to be shown if the client doesn't support buttons
     * @param callback The web hook that will be called when a button is pressed
     * @param colour The html colour code of the line next to the buttons
     * @param buttons An array of buttons
     */
    bot.sendButtons = function (channel, text, fallback, callback, colour, buttons){
        for(var i in buttons){
            if(buttons.hasOwnProperty(i)){
                var button = buttons[i];
                if(!button.type)buttons[i].type = "button";
                if(!button.value)buttons[i].value = button.name;
            }
        }
        bot.web.chat.postMessage(channel, "", {attachments: [
            {
                text: text,
                fallback: fallback,
                callback_id: callback,
                color: colour,
                attachment_type: "default",
                actions: buttons,
                "mrkdwn_in": ["text"]
            }
        ],
            as_user: true
        });
    };

    bot.sendAttachment = function sendAttachment(channel, text, attachments, cb){
          bot.web.chat.postMessage(channel, text, {attachments: attachments}, cb);
    };


    bot.saveConfig = saveConfig;
    bot.loadConfig = loadConfig;


    bot.rtm.start();
    bot.log("Waiting for bot to start...");
    bot.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function rtmAuthEvent(data){
        bot.log("RTM Client authenticated.");
        cb();
    });

    bot.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function rtmOpenEvent(data){
        if(bot.failedModules > 0){
            bot.sendMessage({
                to: bot.config.misc.mainChannel,
                message: "WARNING: *"+bot.failedModules+"* modules failed to load. Consult the log for more details."
            });
        }
    });

    bot.rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, function wsErrorEvent(data){
        bot.log("RTM WebSocket error:");
        bot.log(data);
    });

    bot.rtm.on(CLIENT_EVENTS.RTM.WS_CLOSE, function wsCloseEvent(data){
        bot.log("RTM Websocket closed with code: "+(WS_CLOSE_CODES[data] ? WS_CLOSE_CODES[data] : data));
    });

    bot.rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, function disconnectEventEvent(data){
        bot.log("RTM Client disconnected, not attempting to reconnect.");
        bot.log(data);

    });

    bot.rtm.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, function attemptingReconnectEvent(data){
        bot.log("RTM Client disconnected, attempting to reconnect.");
        bot.log(data);
    });

    bot.rtm.on(CLIENT_EVENTS.WEB.RATE_LIMITED, function rateLimitEvent(data){
        bot.log("Web request rate limited:");
        bot.log(data);
    });

    bot.rtm.on(RTM_EVENTS.MESSAGE, function (messageData) {
        var message = messageData.text;
        var channelID = messageData.channel;
        var user = "<"+messageData.user+">";
        var userID = messageData.user;
        if(message) {
            for(var i in bot.messageHandlers){
                if(bot.messageHandlers.hasOwnProperty(i)){
                    bot.messageHandlers[i](message, channelID, user, userID);
                }
            }
        }
    });
}


function busInit(){
    bot.log("Creating message bus...");
    bot.bus = simplebus.createBus(1000);
    bot.bus.post("OcelotBOT startup");
    bot.bus.subscribe(function busSubscribe(msg){
       bot.log("Received message: "+msg);
    });
}




process.on('uncaughtException', function uncaughtException(err){
    bot.log(err.stack);
    bot.lastCrash = new Date();
});

startBot();