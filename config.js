/**
 * Created by Peter on 07/07/2016.
 */
var fs = require('fs');
module.exports = function(bot){

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

    return {
        init: function initConfig(cb){
            bot.loadConfig = function loadConfig(cb){
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
                            if(cb)
                                cb();
                        }catch(e){
                            bot.log("Config parse error: "+e);
                            if(cb)
                                cb();
                        }
                    }
                });
            };

            bot.saveConfig = function saveConfig(cb){
                fs.writeFile("config.json", JSON.stringify(bot.config, null, "  "), function writeConfigFile(err){
                    if(err){
                        bot.log("Error writing configuration file: "+err);
                        if(cb)
                            cb();
                    }else{
                        bot.log("Configuration saved successfully.");
                        if(cb)
                            cb();
                    }
                });
            };


            bot.log("Initialising config...");


            bot.loadConfig(function(){
                bot.saveConfig(function(){
                    if(cb)
                        cb();
                });
            });
        }
    }
};