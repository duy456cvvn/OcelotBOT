/*
* Copyright UnacceptableUse 2016
 */

var request = require('request');
var async = require('async');

module.exports = function(bot) {
    var object = {
        errors: {
            "https://unacceptableuse.com": [],
            "https://boywanders.us": [],
            "https://ocelotworks.com": [],
            "http://files.unacceptableuse.com": [],
            "http://unacc.eu": [],
            "https://docs.ocelotworks.com": [],
            "https://dvd604.pw": [],
            "http://vpn.tekno.pw": [],
            "https://tekno.pw": [],
            "https://alexmcgrath.com": [],
            "https://petermaguire.xyz": [],
            "https://earth.boywanders.us/": []
        },
        lastErrors: {
            "https://unacceptableuse.com": [],
            "https://boywanders.us": [],
            "https://ocelotworks.com": [],
            "http://files.unacceptableuse.com": [],
            "http://unacc.eu": [],
            "https://docs.ocelotworks.com": [],
            "https://dvd604.pw": [],
            "http://vpn.tekno.pw": [],
            "https://tekno.pw": [],
            "https://alexmcgrath.com": [],
            "https://petermaguire.xyz": [],
            "https://earth.boywanders.us/": []
        },
        name: "Web service status monitor",
        init: function init(cb) {
            bot.log("Status monitor initialized");

            setInterval(function runStatusMonitor(){
                if(!bot.config.statusChecker.enabled)return;
               // bot.log("Running status monitor");

                async.each(Object.keys(object.errors), function(url, cb){
                    //bot.log("Checking "+url);
                    checkSite(url, function(error){
                        //bot.log("Checked "+url+" got errors "+JSON.stringify(error));
                        object.errors[url] = error;
                        cb();
                    });
                }, function(){
                    checkPetermon(function(newErrors){
                        object.errors["https://unacceptableuse.com"] = object.errors["https://unacceptableuse.com"].concat(newErrors);
                        if(JSON.stringify(object.errors) != JSON.stringify(object.lastErrors)){ //OBJECT HASHING WOO
                            bot.log("Oh no found some errors");
                            bot.log(JSON.stringify(object.errors));
                            bot.log(JSON.stringify(object.lastErrors));
                            var msg = "";
                            var errorCount = 0;
                            for(var id in object.errors){
                                if(object.errors.hasOwnProperty(id)){
                                    if(object.errors[id].length > 0){
                                        errorCount++;
                                        msg+=id+":\n";
                                        msg+="- "+object.errors[id].join("\n")+"\n";
                                    }
                                }
                            }
                            msg = "*"+errorCount+"* sites have issues:\n"+msg;
                            if(errorCount > 5)msg = "HOLY SHIT!!1 "+msg;
                            object.lastErrors = object.errors;
                            if(errorCount === 0){ //This is the worst thing ive ever written
                                bot.sendMessage({
                                    to: bot.config.misc.mainChannel,
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
                });
            }, 10000);
            cb();
        }
    };

    return object;
};


function checkPetermon(cb){
    var errors = [];
    var timeStarted = new Date().getTime();
    request("https://unacceptableuse.com/petermon/music/nowplaying", function(err, resp, body){
        var diff = parseInt((new Date().getTime()-timeStarted)/1000);
        if(diff > 2){
            errors.push("*Petify took "+diff+" seconds to load.*");
        }
       if(err){
           errors.push("Error accessing petify: "+err);
           cb(errors);
       }else{
           if(resp.statusCode === 200){
                try{
                    var data = JSON.parse(body);
                    if(!data || !data.id){
                        errors.push("Petify API bad response");
                        cb(errors);
                    }else if(data && data.error){
                        errors.push("Petify API error: "+data.error);
                        cb(errors);
                    }
                }catch(e){
                    errors.push("Petify API Malformed response: "+e);
                    cb(errors);
                }
           }else{
               errors.push("Bad statuscode for petify: "+resp.statusCode);
               cb(errors);
           }
       }
    });
}


function checkSite(url, cb){
    var errors = [];
    var timeStarted = new Date().getTime();
    request(url, function(err, resp, body){
        if(err){
            errors.push("Error accessing: "+err);
            cb(errors);
        }else{
            var diff = parseInt((new Date().getTime()-timeStarted)/1000);
            if(diff > 2){
                errors.push("Site took "+diff+" seconds to load");
            }
            if(resp.statusCode === 200){
                if(body && body.length > 5){
                    // errors = [];
                    cb(errors);
                }else{
                    errors.push("Bad body size "+(body ? body.length : "no body"));
                    cb(errors);
                }
            }else{
                errors.push("Unexpected status code HTTP "+resp.statusCode);
                cb(errors);
            }
        }
    });
}