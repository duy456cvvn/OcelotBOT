/**
 * Created by Peter on 19/04/2016.
 */
exports.command = {
    name: "mgt",
    desc: "Management command",
    usage: "mgt eval/config set/get/save/load /add",
    func: function(user, userID, channel, args, message, bot){
        //if(channel !== bot.config.misc.debugChannel)return true;
        if(args[1] === "eval"){
            eval(args.slice(2).join(" "));
            bot.sendMessage({
                to: channel,
                message: "Executed."
            });
        }else if(args[1] === "config"){
            if(args.length < 3)return false;

            if(args[2] === "set"){
                if(args.length < 4)return false;
                    bot.sendMessage({
                        to: channel,
                        message: '`config.'+args[3]+"."+args[4]+" = "+args[5]+"`"
                    });
                    bot.config[args[3]][args[4]] = args[5];
            }else if(args[2] === "get") {
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
            }else if(args[2] === "save") {
                bot.saveConfig();
                bot.sendMessage({
                    to: channel,
                    message: "Saved config."
                });
            }else if(args[2] === "load"){
                bot.saveConfig();
                bot.sendMessage({
                    to: channel,
                    message: "Reloaded config. (Commands with onReady events may not take update without restart)"
                });

            }else{
                return false;
            }
        }else if(args[1] === "add"){
            try {
                var location = './'+args[2];
                var newCommand;
                uncache(location, function(){
                    newCommand = require(location).command;
                    bot.commands[newCommand.name] = newCommand;
                    if(newCommand.onReady)
                        newCommand.onReady(bot);

                    bot.sendMessage({
                        to: channel,
                        message: "`Loaded command: " + newCommand.name+"`"
                    });
                });


            }catch(e){
                bot.sendMessage({
                    to: channel,
                    message: "`Error loading module "+args[2]+" - "+e+"`"
                });
            }
        }else{
            return false;
        }

        return true;
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

function uncache(moduleName, cb) {
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