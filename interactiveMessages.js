/**
 * Created by Peter on 06/07/2016.
 */

var express         = require('express'),
    bodyparser      = require('body-parser'),
    fs              = require('fs'),
    https           = require('https');

module.exports = function interactiveMessages(bot) {
    return {
        name: "Interactive Message Listener",
        init: function initInteractiveMessages(cb) {

            bot.log("Starting HTTP Server...");

            bot.registerInteractiveMessage = function registerInteractiveMessage(callback_id, func){
                bot.log("Registered interactive message for "+callback_id);
                bot.interactiveMessages[callback_id] = func;
            };

            bot.app = express();

            bot.httpsServer = https.createServer({
                key: fs.readFileSync(bot.config.slack.certs.key),
                cert: fs.readFileSync(bot.config.slack.certs.cert)
            }, bot.app).listen(3001, function httpServerInit(){
                bot.log("HTTP Server opened on port 3001");
                if(cb)
                    cb();
            });

            bot.app.use(express.static('static'));

            bot.app.use(bodyparser.urlencoded());

            bot.app.get('/slack/oauth', function getSlackOauth(req, res){
                bot.web.oauth.access(bot.config.slack.clientId,bot.config.slack.clientSecret, req.query.code, function(err, data){
                    res.send(JSON.stringify(data));
                });
            });

            bot.app.get('/slack/interactive', function getSlackEndpoint(req, res){
                bot.log("Received GET Request to slack endpoint");
            });

            bot.app.post('/slack/interactive', function postSlackEndpoint(req, res){
                if(req.body.payload){
                    var info = JSON.parse(req.body.payload);
                    if(info.token === bot.config.slack.payload_token){
                        if(bot.interactiveMessages[info.callback_id]) {
                            for(var i in info.actions){
                                if(info.actions.hasOwnProperty(i)){
                                    bot.log("Triggered interactive message callback");
                                    try {
                                        res.send(bot.interactiveMessages[info.callback_id](info.actions[i].name, info.actions[i].value, info));
                                    }catch(e){
                                        bot.error("Error during interactive message: "+e);
                                        res.send(e);
                                    }
                                }
                            }
                        }else{
                            bot.sendMessage({
                                to: bot.config.misc.mainChannel,
                                message: "*WARNING:* Received interactive message with no callback registered: `"+info.callback_id+"`"
                            });
                            res.send("No callback registered.");
                        }
                    }else{
                        bot.warn("Received interactive message with invalid payload token.");
                        res.send("Invalid payload token.")
                    }


                }else{
                    bot.warn("Invalid Interactive Message request received.");
                    res.send("Invalid request.");
                }

            });

            bot.app.get('/', function(req, res){
                res.send("Hello World!");
            });
        }
    }

};
