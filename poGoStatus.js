/**
 * Created by Peter on 17/07/2016.
 */
var ping = require('ping');
var poGoIsUp = true;
var poGoServer = "pgorelease.nianticlabs.com";
module.exports = function(bot){

    var checkPogoStatus = function checkPogoStatus(){

        ping.promise.probe(poGoServer).then(function(res){
            if((!res.alive || res.time > 3000) && poGoIsUp){
                bot.sendMessage({
                    to: bot.config.misc.mainChannel,
                    message: "The Pokemon Go servers appear to be *"+(res.alive ? "slow" : "down")+"*. I'll tell you when they're back up..."
                });
                setInterval(checkPogoStatus, 60000); //1 Minute
                poGoIsUp = false;
            }else if(res.alive && res.time < 3000 && !pogoIsUp){
                bot.sendMessage({
                    to: bot.config.misc.mainChannel,
                    message: "The Pokemon Go servers appear to be back up again!"
                });
                setInterval(checkPogoStatus, 3.6e6); //1 Hour
                poGoIsUp = true;
            }
        });

        //ping.sys.probe(poGoServer, function pingResponse(isAlive, err){
        //    if(err){
        //        bot.warn("Error checking pogo status: "+err)
        //    }else{
        //        if(isAlive && !poGoIsUp){
        //
        //        }else if(!isAlive && poGoIsUp){
        //
        //        }
        //        poGoIsUp = isAlive;
        //    }
        //
        //});
    };

    return {
        init: function(cb){
            checkPogoStatus();
            if(cb)
                cb();
        }
    }
};

