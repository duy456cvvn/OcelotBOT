/**
 * Created by Peter on 19/04/2016.
 */

var sargs = {
    eval: function(user, userID, channel, args, message, bot){
        //if(userID === "U1DNDKZDW" || userID === "U232Q4WQJ"){
        //    bot.sendMessage({
        //        to: channel,
        //        message: "lol no"
        //    });
        //    return true;
        //}
        eval(args.slice(2).join(" "));
        bot.sendMessage({
            to: channel,
            message: "Executed."
        });
    },
    evalOutput: function(user, userID, channel, args, message, bot){
        //if(userID === "U1DNDKZDW" || userID === "U232Q4WQJ"){
        //    bot.sendMessage({
        //        to: channel,
        //        message: "lol no"
        //    });
        //    return true;
        //}
        bot.sendMessage({
            to: channel,
            message:  eval(args.slice(2).join(" "))
        });
    },
    config: function(user, userID, channel, args, message, bot){
        switch(args[3]){
            default:
                return false;
            case "set":
                if(args.length < 4)return false;
                bot.sendMessage({
                    to: channel,
                    message: `\`config.${args[3]}.${args[4]} = ${args[5]}\``
                });
                bot.config[args[3]][args[4]] = args[5];
                bot.log(`${user} set ${args[3]}.${args[4]} to ${args[5]}`);
                break;
            case "get":
                if (!bot.config[args[3]][args[4]]) {
                    bot.sendMessage({
                        to: channel,
                        message: "Specified config key doesn't exist."
                    });
                } else {
                    bot.sendMessage({
                        to: channel,
                        message: "`config." + args[3] + "." + args[4] + " = " + bot.config[args[3]][args[4]] + "`"
                    });
                }
                break;
            case "save":
                bot.saveConfig(function saveConfig(){
                    bot.log("Configuration saved manually.");
                    bot.sendMessage({
                        to: channel,
                        message: "Saved config."
                    });
                });
                break;
            case "load":
                bot.loadConfig(function loadConfig(){
                    bot.log("Configuration loaded manually.");
                    bot.sendMessage({
                        to: channel,
                        message: "Reloaded config. (Commands with onReady events may not take update without restart)"
                    });
                });
                break;
        }
    },
    addNew: function(user, userID, channel, args, message, bot){
        var location = './' + args[2];
        var newCommand = require(location).command;
        bot.commands[newCommand.name] = newCommand;
        if (newCommand.onReady)
            newCommand.onReady(bot);

        bot.sendMessage({
            to: channel,
            message: "`Loaded command: " + newCommand.name + "`"
        });
    },
    add: function(user, userID, channel, args, message, bot){
        try {
            var location = './' + args[2];
            var newCommand;
            var ranOnce = false;
            require.uncache(location, function () {
                    newCommand = require(location).command;
                    bot.commands[newCommand.name] = newCommand;
                if(!ranOnce) {
                    if (newCommand.onReady)
                        newCommand.onReady(bot);

                    bot.sendMessage({
                        to: channel,
                        message: "`Loaded command: " + newCommand.name + "`"
                    });
                    ranOnce = true;
                }

            });


        } catch (e) {
            bot.sendMessage({
                to: channel,
                message: "`Error loading module " + args[2] + " - " + e + "`"
            });
        }
    },
    service: function(user, userID, channel, args, message, bot){
        switch(args[2]) {
            default:
                return false;
            case "list":
                var output = "*Running Services:*\n_Pre-load Services:_\n";
                for(var i in bot.services.loadBefore)
                    if(bot.services.loadBefore.hasOwnProperty(i))
                        output += i+". "+(bot.services.loadBefore[i].name || "Legacy Service")+"\n";
                output+= "_Post-load Services:_\n";
                for(i in bot.services.loadAfter)
                    if(bot.services.loadAfter.hasOwnProperty(i))
                        output += i+". "+(bot.services.loadAfter[i].name || "Legacy Service")+"\n";
                bot.sendMessage({
                	to: channel,
                	message: output
                });
                break;
            case "add":
                try {
                    var location = './../' + args[3];
                    var newService;
                    var ranOnce = false;
                    require.uncache(location, function () {
                        if(!ranOnce){
                            newService = require(location)(bot);
                            bot.services.loadAfter.push(newService);
                            bot.sendMessage({
                                to: channel,
                                message: "Loading service: `" + newService.name + "`..."
                            });
                            newService.init(function(){
                                bot.sendMessage({
                                    to: channel,
                                    message: "Loaded service: `" + newService.name + "`"
                                });
                            });
                            ranOnce = true
                        }
                    });
                } catch (e) {
                    bot.sendMessage({
                        to: channel,
                        message: "`Error loading service " + args[2] + " - " + e + "`"
                    });
                }
                break;
            case "restart":
                if(!args[3]) {
                    bot.sendMessage({
                        to: channel,
                        message: "!msg service restart [id] [loadBefore/loadAfter]"
                    });
                }else {
                    if(bot.services[args[4]][args[3]]) {
                        bot.services[args[4]][args[3]].init(function(){
                           bot.sendMessage({
                           	to: channel,
                           	message: "Done (Like my motivation to continue writing this command)"
                           });
                        });
                    }else {
                        bot.sendMessage({
                        	to: channel,
                        	message: "Service not found."
                        });
                    }

                }
                break;
        }
    },
    handler: function(user, userID, channel, args, message, bot){

    }
};

exports.command = {
    name: "mgt",
    desc: "Management command",
    usage: "mgt "+Object.keys(sargs).join("/"),
    func: function(user, userID, channel, args, message, bot){
        if(bot.isDiscord && userID !== "139871249567318017"){
            bot.sendMessage({
                to: channel,
                message: "Nice try."
            });
            return true;
        }else{
            return sargs[args[1]] ? (sargs[args[1]](user, userID, channel, args, message, bot) || true) : false;
        }
    }
};

require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};

require.uncache = function uncache(moduleName, cb) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
        if(cb)
            cb();
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
}