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
    express         = require('express'),
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
    1015: "TLS Handshake failiure"
};

var bot = {};
bot.config = {
    slack:{
        username: "",
        token: "",
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
        proxyURL: ""
    },
    petermon:{
        username: "",
        password: "",
        url: ""
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
bot.currentTopic = 0;
bot.topicCounter = 0;



function startBot(){
    bot.log = function(message){
        var caller = caller_id.getData();
        var file = caller.filePath.split("/");
        console.log("["+file[file.length-1]+(caller.functionName ? "/"+caller.functionName+"] "+message : "] "+message));
    };


    async.series([
        loadConfig,
        saveConfig,
        loadCommands,
        mysqlInit,
        httpInit,
        botInit,
        checkImportantDates
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

    bot.rtm = new RtmClient(bot.config.slack.token);
    bot.web = new WebClient(bot.config.slack.token);

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
                .replace(bot.config.slack.token, "<REDACTED>")
                .replace(bot.config.slack.webhook, "<REDACTED>")
                .replace(bot.config.slack.payload_token, "<REDACTED>")
                .replace(bot.config.slack.clientSecret, "<REDACTED>")
                .replace(bot.config.database.password, "<REDACTED>");

            bot.rtm.sendMessage(data.message, data.to, function sendMessageResult(err, resp){
                if(err){
                    bot.log("Error sending message: "+JSON.stringify(err));
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
                actions: buttons
            }
        ],
            as_user: true
        });
    };

    bot.incrementTopic = function (channel) {
        bot.currentTopic++;
        bot.updateTopic(channel);
    };

    bot.decrementTopic = function (channel) {
        if (bot.currentTopic > 0) {
            bot.currentTopic--;
            bot.updateTopic(channel);
        }
    };

    bot.setTopic = function (index) {
        bot.currentTopic = index;
    };

    bot.updateTopic = function (channel) {
        bot.connection.query("SELECT `topic` FROM stevie.Topics WHERE `id` = ?;", [bot.currentTopic], function topicUpdateQuery(err, result) {
            if (err || !result[0] || !result[0].topic) {
               // bot.currentTopic = 0;
                bot.sendMessage({
                    to: channel,
                    message: "Could not switch topic, best log this on producteev and pester @Peter until he fixes it: " + err
                });
            } else {
                bot.log("Changing topic...");
                bot.web.channels.setTopic(channel, result[0].topic);
            }
            fs.writeFile(bot.config.topic.file, bot.currentTopic, function topicFileWriteError(err) {
                if (err) {
                    bot.log("Could not save topic! " + err);
                }
            });
        });

    };

    bot.saveConfig = saveConfig;
    bot.loadConfig = loadConfig;


    bot.rtm.start();
    bot.log("Waiting for bot to start...");
    bot.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function rtmAuthEvent(data){
        bot.log("RTM Client authenticated.");
        cb();
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
            handleAutoReplies(message, channelID);
            handleCommand(message, channelID, user, userID);
        }
        handleTopicUpdate(channelID);
    });
}

function loadCommands(cb){
    bot.commands = {};
    bot.log("Loading commands...");
    //Reads the /commands directory, and loads exports.command of each file
    var files = fs.readdirSync(bot.config.misc.commandsDir);
    for (var i in files) {
        if(files.hasOwnProperty(i)){
            if(!fs.lstatSync('./'+bot.config.misc.commandsDir+'/'+files[i]).isDirectory()){
                try {
                    var newCommand = require('./' + bot.config.misc.commandsDir + '/' + files[i]).command;
                    bot.log("Loaded command: " + newCommand.name);
                    bot.commands[newCommand.name] = newCommand;
                }catch(e){
                    bot.log("Error loading module "+files[i]+" - "+e);
                    bot.log(e);
                }
            }
        }
    }
    if(cb)
        cb();
}

function mysqlInit(cb){
    bot.connection = mysql.createConnection(bot.config.database);

    bot.connection.on('error', function mysqlErrorEvent(err){
        bot.log("MySQL Error: %s", err);
        bot.log(err);
        setTimeout(mysqlInit, 3000);
    });

    bot.connection.on('disconnected', function mysqlDisconnectEvent(){
        bot.log("MySQL Disconnected");
        setTimeout(mysqlInit, 3000);
    });

    try {
        bot.connection.connect(function mySqlConnect(err) {
            if (err){
                bot.log('Error connecting: ' + err);
                if(cb)
                    cb();
                setTimeout(mysqlInit, 3000);
            }
            else{
                bot.log("Connected to MySQL");
                if(cb)
                    cb();
            }

        });
    }catch(e){
        bot.log("Exception conencting to MySQL: %s", e);
        setTimeout(mysqlInit, 3000);
    }
}

function busInit(){
    bot.log("Creating message bus...");
    bot.bus = simplebus.createBus(1000);
    bot.bus.post("OcelotBOT startup");
    bot.bus.subscribe(function busSubscribe(msg){
       bot.log("Received message: "+msg);
    });
}

function httpInit(cb){
    bot.app = express();
    bot.httpsServer = https.createServer({
        key: fs.readFileSync(bot.config.slack.certs.key),
        cert: fs.readFileSync(bot.config.slack.certs.cert)
    }, bot.app).listen(3001, function httpServerInit(){
        bot.log("HTTP Server opened on port 3001");
        if(cb)
            cb();
    });

    bot.app.get('/slack/oauth', function getSlackOauth(req, res){
        bot.web.oauth.access(bot.config.slack.clientId,bot.config.slack.clientSecret, req.query.code, function(err, data){
            res.send(JSON.stringify(data));
        });
    });

    bot.app.get('/slack/interactive', function getSlackEndpoint(req, res){
        bot.log("Received GET Request to slack endpoint");
    });

    bot.app.post('/slack/interactive', function postSlackEndpoint(req, res){
        var bodyStr = '';
        req.on("data",function(chunk){
            bodyStr += chunk.toString();
        });
        req.on("end",function(){
            res.send(bodyStr);
        });
        bot.log("Message body:"+bodyStr);
        res.send("");
    });

    bot.app.get('/', function(req, res){
       res.send("Hello World!");
    });


}

function checkImportantDates(cb){
    var date = new Date();
    if(bot.config.importantDates[date.getDate()+"/"+date.getMonth()]){
        bot.sendMessage({
            to: bot.config.misc.mainChannel,
            message: bot.config.importantDates[date.getDate()+"/"+date.getMonth()]
        });
    }else{
        bot.log("No important dates today.");
    }
    setTimeout(checkImportantDates,  8.64e7); //24 hours
    if(cb)
        cb();
}

function handleCommand(message, channelID, user, userID){
    if (message.startsWith(bot.config.misc.commandPrefix)) {
        var args = message.split(" ");
        var command = args[0].replace(bot.config.misc.commandPrefix, "").toLowerCase();
        if (bot.commands[command]) {
            try {
                if (!bot.commands[command].func(user, userID, channelID, args, message, bot)) {
                    bot.sendMessage({
                        to: channelID,
                        message: "*Invalid Usage:*\n!" + bot.commands[command].usage
                    });
                }
            } catch (e) {
                bot.sendMessage({to: channelID, message: "Error performing command: " + e.toString()});
            }
        }
    }
}

function handleAutoReplies(message, channelID){
    message = message.toLowerCase();
    if(message.indexOf("ass") > -1 && message.toLowerCase().indexOf("-") === -1){
        var words = message.toLowerCase().split(" ");
        for(var i in words){
            if(words.hasOwnProperty(i)){
                if(words[i] === "ass" && words.length > parseInt(i)+1){
                    bot.sendMessage({
                        to: channelID,
                        message: "*ass-"+words[parseInt(i)+1]+"*"
                    });
                    break;
                }
            }
        }
    }
    if(message.indexOf("whoop there it is") > -1){
        bot.sendMessage({
            to: channelID,
            message: "_*WHO THE FUCK SAID THAT?*_"
        });
    }
    if (message === "test") {
        bot.sendMessage({
            to: channelID,
            message: "icles"
        });
    }
    if(message.indexOf("too hot") > -1){
        bot.sendMessage({
            to: channelID,
            message: "*hot damn*"
        });
    }
}

function handleTopicUpdate(channelID){
    bot.topicCounter++;

    if(bot.topicCounter > bot.config.topic.threshold){
        bot.incrementTopic(channelID);
        bot.topicCounter = 0;
    }
}

process.on('uncaughtException', function uncaughtException(err){
    bot.log(err);
    console.log(err);
});

startBot();