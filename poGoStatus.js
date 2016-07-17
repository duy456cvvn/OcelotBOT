/**
 * Created by Peter on 17/07/2016.
 */
var ping = require('ping');
var poGoIsUp = true;
var poGoServer = "pgorelease.nianticlabs.com";
module.exports = function(bot){

    var checkPogoStatus = function checkPogoStatus(){
        ping.sys.probe(poGoServer, function pingResponse(isAlive, err){
            if(err){
                bot.warn("Error checking pogo status: "+err)
            }else{
                if(isAlive && !poGoIsUp){
                    bot.sendMessage({
                        to: bot.config.misc.mainChannel,
                        message: "The Pokemon Go servers appear to be back up again!"
                    });
                    setInterval(checkPogoStatus, 3.6e6); //1 Hour
                }else if(!isAlive && poGoIsUp){
                    bot.sendMessage({
                        to: bot.config.misc.mainChannel,
                        message: "The Pokemon Go servers appear to be *down*. I'll tell you when they're back up..."
                    });
                    setInterval(checkPogoStatus, 60000); //1 Minute
                }
                poGoIsUp = isAlive;
            }

        });
    };

    return {
        init: function(cb){

            checkPogoStatus();

            if(cb)
                cb();
        }
    }
};

