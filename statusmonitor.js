/*
* Copyright UnacceptableUse 2016
 */

var request = require('request');
var async = require('async');

module.exports = function(bot) {
    return {
        init: function init(cb) {
            bot.log("Status monitor initialized");
            var lastErrors = {
                "https://unacceptableuse.com": [],
                "https://boywanders.us": [],
                "https://ocelotworks.com": [],
                "http://files.unacceptableuse.com": [],
                "http://unacc.eu": []
            };
            setInterval(function runStatusMonitor(){
               // bot.log("Running status monitor");
                var errors = {
                    "https://unacceptableuse.com": [],
                    "https://boywanders.us": [],
                    "https://ocelotworks.com": [],
                    "http://files.unacceptableuse.com": [],
                    "http://unacc.eu": []
                };

                async.each(Object.keys(errors), function(url, cb){
                    //bot.log("Checking "+url);
                    checkSite(url, function(error){
                        //bot.log("Checked "+url+" got errors "+JSON.stringify(error));
                        errors[url] = error;
                        cb();
                    });
                }, function(){
                    if(JSON.stringify(errors) != JSON.stringify(lastErrors)){ //OBJECT HASHING WOO
                        bot.log("Oh no found some errors");
                        bot.log(JSON.stringify(errors));
                        bot.log(JSON.stringify(lastErrors));
                        var msg = "*Errors:*\n";
                        for(var id in errors){
                            if(errors.hasOwnProperty(id)){
                                if(errors[id].length > 0){
                                    msg+=id+":\n";
                                    msg+="- "+errors[id].join("\n")+"\n";
                                }
                            }
                        }
                        lastErrors = errors;
                        if(msg === "*Errors:*\n"){ //This is the worst thing ive ever written
                            bot.sendMessage({
                                to: "C1LC4QRRS",
                                message: "All errors have been resolved"
                            });
                        }else{
                            bot.sendMessage({
                                to: bot.config.misc.mainChannel,
                                message: msg
                            });
                        }

                    }
                });
            }, 10000);
            cb();
        }
    };
};


function checkSpecial(cb){

}


function checkSite(url, cb){
    var errors = [];
    var timeStarted = new Date().getTime();
    request(url, function(err, resp, body){
        if(err){
            errors.push("*Error accessing: "+err+"*");
            cb(errors);
        }else{
            var diff = (new Date().getTime()-timeStarted)/1000;
            if(diff > 2){
                errors.push("*Site took "+diff+" seconds to load.*");
            }
            if(resp.statusCode === 200){
                if(body && body.length > 5){
                    // errors = [];
                    cb(errors);
                }else{
                    errors.push("*Bad body size "+(body ? body.length : "no body")+"*");
                    cb(errors);
                }
            }else{
                errors.push("*Unexpected status code HTTP "+resp.statusCode+"*");
                cb(errors);
            }
        }
    });
}