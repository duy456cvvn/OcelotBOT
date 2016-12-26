/*
* Copyright UnacceptableUse 2016
 */

var request = require('request');
var async = require('async');
var ping = require('ping');

module.exports = function(bot) {

    function checkPetermon(cb){
        var errors = [];
        ping.promise.probe("homeof.unacceptableuse.com")
            .then(function (res) {
                if(!res.alive){
                    errors.push("Internet connection down");
                }
                bot.connection.query("SELECT timestamp,petermon_cpu,petermon_temp FROM stevie.pm_status ORDER BY timestamp DESC LIMIT 1;", function (err, result) {
                    if(err){
                       errors.push("Error getting status: ")
                    }else{
                        var status = result[0];
                        var timeDiff = new Date().getTime() - status.timestamp.getTime();
                        if(timeDiff > 5e3){
                            bot.log("Time diff is "+timeDiff);
                            errors.push("Too long has elapsed since last status report.");
                        }
                       if(status.petermon_temp > 50){
                            errors.push("Unusually high temperature.");
                       }
                       if(status.petermon_cpu > 400) {
                           errors.push("Unusually high CPU usage.");
                       }
                    }
                    cb(errors);
                });
            });
    }

    var object = {
        errors: {
            "https://unacceptableuse.com": [],
            "http://files.unacceptableuse.com": [],
            "https://petermaguire.xyz": [],
            "http://unacc.eu": [],
            "https://boywanders.us": [],
            "https://earth.boywanders.us/": [],
            "http://mercury.boywanders.us/": [],
            "https://ocelotworks.com": [],
            "https://docs.ocelotworks.com": [],
            "https://dvd604.pw": [],
            "https://tekno.pw": [],
            "http://vpn.tekno.pw": [],
            "https://blog.tekno.pw": [],
            "https://alexmcgrath.com": [],
            "Petify Frontend": [],
            "Petermon HA": []
        },
        lastErrors: {
            "https://unacceptableuse.com": [],
            "http://files.unacceptableuse.com": [],
            "https://petermaguire.xyz": [],
            "http://unacc.eu": [],
            "https://boywanders.us": [],
            "https://earth.boywanders.us/": [],
            "http://mercury.boywanders.us/": [],
            "https://ocelotworks.com": [],
            "https://docs.ocelotworks.com": [],
            "https://dvd604.pw": [],
            "https://tekno.pw": [],
            "http://vpn.tekno.pw": [],
            "https://blog.tekno.pw": [],
            "https://alexmcgrath.com": [],
            "Petify Frontend": [],
            "Petermon HA": []
        },
        name: "Web service status monitor",
        init: function init(cb) {
            bot.log("Status monitor initialized");

            setInterval(function runStatusMonitor(){
                if(!bot.config.statusChecker.enabled)return;
               // bot.log("Running status monitor");

                async.each(Object.keys(object.errors), function(url, cb){
                    //bot.log("Checking "+url);
                    if(url.startsWith("http")){
                        checkSite(url, function(error){
                            //bot.log("Checked "+url+" got errors "+JSON.stringify(error));
                            object.errors[url] = error;
                            cb();
                        });
                    }else{
                        cb();
                    }
                }, function(){
                    checkPetify(function(petifyErrors){
                        object.errors["Petify Frontend"] = object.errors["Petify Frontend"].concat(petifyErrors);
                        checkPetermon(function(petermonErrors){
                            object.errors["Petermon HA"] = object.errors["Petermon HA"].concat(petermonErrors);
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
                                            msg+=object.errors[id].join("\n")+"\n";
                                        }
                                    }
                                }
                                msg = "*"+errorCount+"* sites have issues:\n"+msg;
                                if(errorCount > 5)msg = "HOLY SHIT!!1 "+msg;
                                object.lastErrors = object.errors;
                                if(errorCount == 0){ //This is the worst thing ive ever written
                                    bot.log("All errors are gone");
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
                });
            }, 10000);
            cb();
        }
    };

    return object;
};


function checkPetify(cb){
    var errors = [];
    var timeStarted = new Date().getTime();
    request("https://unacceptableuse.com/petify/api/status", function(err, resp, body){
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
                    if(!data || data.errorCount === null){
                        errors.push("Petify API bad response ("+JSON.stringify(data)+")");
                    }else if(data && data.errorCount > 5){
                        errors.push("Petify elevated error rate: "+data.errorCount+" (Request Rate: "+data.requestCount+")");
                    }
                    cb(errors);
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