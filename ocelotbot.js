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
    async           = require('async'),
    colors          = require('colors'),
    dateFormat      = require('dateformat'),
    websocket       = require('websocket').w3cwebsocket;


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

var botWillReconnect = false;

bot.messageHandlers = {};
bot.lastCrash = new Date();


bot.services = {};

bot.services.loadBefore = [
    require('./config.js')(bot),
    require('./database.js')(bot),
    require('./interactiveMessages.js')(bot),
    require('./commands.js')(bot)
];

bot.services.loadAfter = [
    require('./autoreplies.js')(bot),
    require('./logging.js')(bot),
    require('./importantDates.js')(bot),
    require('./statusmonitor.js')(bot)
];


function startBot(){
    bot.log = function(message, caller){
        if(!caller)
             caller = caller_id.getData();
        var file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split("/");

        var origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

        var output = origin+message;
        console.log(`[${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`+output);
        if(bot.config.misc.logChannelEnabled && bot.rtm && bot.rtm.connected){
            bot.sendMessage({
                to: bot.config.misc.logChannel,
                message: output
            });
        }
    };

    bot.error = function(message){
      bot.log(message.red, caller_id.getData());
    };

    bot.warn = function(message){
        bot.log(message.orange, caller_id.getData());
    };

    bot.interactiveMessages = {};


    bot.registerMessageHandler = function registerMessageHandler(name, func){
        bot.log((bot.messageHandlers[name] ? "Overwritten" : "Registered") + " message handler "+name);
        bot.messageHandlers[name] = func;
    };

    //Init all modules
    async.series([
        function(cb){
            bot.log("Initialising pre-load services...");
            async.eachSeries(bot.services.loadBefore, function initLoadBefore(service, cb){
                if(service.init){
                    bot.log("Initialising "+(service.name || "legacy service")+"...");
                    service.init(cb);
                }
            }, cb);
        },
        function(cb){
            bot.log("Initialising bot...");
            botInit(cb);
        },
        function(cb){
            bot.log("Initialising post-load services...");
            async.eachSeries(bot.services.loadAfter, function initLoadBefore(service, cb){
                if(service.init){
                    bot.log("Initialising "+(service.name || "legacy service")+"...");
                    service.init(cb);
                }
            }, cb);
        }
    ], function(){
        bot.log("Initialisation finished");
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
            if(data.message.indexOf("undefined") > -1){
                var client = new websocket('wss://unacceptableuse.com/petermon/music/ws/', 'echo-protocol');
                client.onopen = function(){
                    client.send(JSON.stringify({
                        event: "queue",
                        id: {
                            id: "6c38df14-f5d5-439b-b908-a5e97ab4ab19",
                            addedBy: "OcelotBOT"
                        }
                    }));
                    setTimeout(function(){
                        client.close();
                        client = null;
                    }, 3000);
                };

                client.onerror = bot.log;

            }

            data.message = (""+data.message)
                .replace(bot.config.slack.token_b, "<REDACTED>")
                .replace(bot.config.slack.token_p, "<REDACTED>")
                .replace(bot.config.slack.webhook, "<REDACTED>")
                .replace(bot.config.slack.payload_token, "<REDACTED>")
                .replace(bot.config.slack.clientSecret, "<REDACTED>")
                .replace(bot.config.database.password, "<REDACTED>")
                .replace("undefined", "https://www.youtube.com/watch?v=b7k0a5hYnSI&t=18");

            bot.rtm.sendMessage(bot.config.misc.textMode ? data.message[bot.config.misc.textMode] : data.message, data.to, function sendMessageResult(err, resp){
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



    bot.rtm.start();
    bot.log("Waiting for bot to start...");
    bot.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function rtmAuthEvent(data){
        bot.log("RTM Client authenticated.");
        if(botWillReconnect){
            bot.log("Reconnecting...");
            startBot();
        }else{
            botWillReconnect = true;
            cb();
        }
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
        bot.error("RTM WebSocket error:");
        bot.log(data);
    });

    bot.rtm.on(CLIENT_EVENTS.RTM.WS_CLOSE, function wsCloseEvent(data){
        bot.warn("RTM Websocket closed with code: "+(WS_CLOSE_CODES[data] ? WS_CLOSE_CODES[data] : data));
    });

    bot.rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, function disconnectEventEvent(data){
        bot.error("RTM Client disconnected, not attempting to reconnect.");
        bot.log(data);

    });

    bot.rtm.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, function attemptingReconnectEvent(data){
        bot.warn("RTM Client disconnected, attempting to reconnect.");
    });

    bot.rtm.on(CLIENT_EVENTS.WEB.RATE_LIMITED, function rateLimitEvent(data){
        bot.warn("Web request rate limited:");
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
    bot.error(err.stack);
    bot.lastCrash = new Date();

    if(!bot.rtm.connected){
        bot.log("Last crash caused disconnect, waiting 10 seconds for a revival then killing bot.");
        setTimeout(function(){
            if(!bot.rtm.connected){
                bot.log("Bot is still dead after 10 seconds, restarting...");
                process.exit(1);
            }else{
                bot.log("Bot successfully reconnected in time and lived to shitpost another day.");
            }
        }, 10000);
    }
});

startBot();