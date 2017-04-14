/**
 * Created by Peter on 13/04/2017.
 */


var WebSocketClient = require('websocket').client;

var ws;
module.exports = function(bot) {


    var object = {
        name: "Petify Socket Listener",
        init: function init(cb) {
            if(ws){
                ws.close();
                ws = null;
            }
            ws = new WebSocketClient();
            ws.on('connect', function petifyConnectEvent(connection){
                bot.log("Connected to Petify");
                connection.sendUTF(JSON.stringify({type: "registerDevice", message: bot.config.petify.deviceID}));
                setTimeout(function(){
                    connection.sendUTF(JSON.stringify({type: "receiveSongUpdates", message: true}));
                    bot.log("Sent receiveSongUpdates Message")
                }, 1000);

                connection.on('message', function(message){
                    try {
                        var data = JSON.parse(message.utf8Data);

                        if (data.type === "songUpdate" && data.message.type === "play") {
                            bot.web_p.users.profile.set({
                                user: "U0LAVH43A",
                                profile: JSON.stringify({
                                    status_text: "Now Playing: " + data.message.data.artist + " - " + data.message.data.title,
                                    status_emoji: ":petify:"
                                })
                            }, function(){
                                console.log(JSON.stringify(arguments));
                            });
                        }
                    }catch(e){
                        console.log(e);
                        bot.log("Fatrted");
                    }
                });

                connection.on('close', function petifyConnectClose(code){
                    bot.log("Connection closed - reconnecting "+code);
                    if(code !== 1000)
                        setInterval(object.init, 1000);
                });
                connection.on('error', function petifyConnectClose(err){
                    bot.log("Connection error - reconnecting "+err);
                    setInterval(object.init, 1000);
                });
            });
            bot.log("Connecting to Petify...");
            ws.connect("wss://unacceptableuse.com/petify/ws/updates/"+bot.config.petify.apiKey, null);
            cb();
        }


    };

    return object;
};

