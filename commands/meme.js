/**
 * Created by Peter on 01/07/2017.
 */
const async = require('async');
module.exports = {
    name: "Meme",
    usage: "meme <meme/list/add <name> <url>/globaladd <name> <url>",
    accessLevel: 0,
    commands: ["meme"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: Invalid usage. !meme <meme/list/add <name> <url>/globaladd <name> <url>>"
            });
        }else{
            const server = recv.getServerFromChannel(channel);
            const arg = args[1].toLowerCase();
            if(arg === "list") {
                bot.database.getMemes(server)
                    .then(function(result){
                        var globalMemes = "";
                        var serverMemes = "";

                        async.eachSeries(result, function (meme, cb) {
                            if (meme.server == "global") {
                                globalMemes += meme.name + " ";
                            } else {
                                serverMemes += meme.name + " ";
                            }
                            cb();
                        }, function () {
                            recv.sendMessage({
                                to: channel,
                                message: "**Available Memes:**\n__:earth_americas: **Global** memes:__ " + globalMemes + "\n__:house_with_garden:**" + recv.getServerInfo(server).name + "** memes:__ " + serverMemes
                            });
                        });
                    })
                    .catch(function(err){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: There was an error getting the meme list. Try again later.\n" + err
                        });
                    });
            }else if(arg === "remove"){
                bot.database.removeMeme(args[2].toLowerCase(), server, userID)
                    .then(function(result){
                        if(result.affectedRows == 0){
                            recv.sendMessage({
                                to: channel,
                                message: ":warning: Meme doesn't exist or you didn't add it. Only the person who added it can remove it.\nIf you still want it removed, do !meme report "+args[2]
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: ":white_check_mark: Meme removed."
                            });
                        }
                    })
                    .catch(function(err){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: Error removing meme: "+err
                        });
                    });
            }else if(arg === "report") {
                recv.sendMessage({
                    to: "139871249567318017",
                    message: `Meme report: ${message}\nFrom: ${userID}\nIn ${channel}/${server.name}`
                }, function(){
                    recv.sendMessage({
                        to: channel,
                        message: "Meme reported successfully."
                    });
                });
            }else if(arg === "add") {
                if (args.length < 4)return false;
                bot.database.addMeme(userID, server, args[2].toLowerCase(), message.substring(message.indexOf(args[3])).trim())
                    .then(function(){
                        recv.sendMessage({
                            to: channel,
                            message: "Meme added."
                        });
                    })
                    .catch(function(err){
                        if (err.message.indexOf("duplicate")) {
                            recv.sendMessage({
                                to: channel,
                                message: "That meme already exists. Try a different name."
                            });
                        } else {
                            recv.sendMessage({
                                to: channel,
                                message: "Error adding meme: " + err
                            });
                        }
                    });
            }else if(arg === "addglobal"){
                bot.database.addMeme(userID, "global", args[2].toLowerCase(), message.substring(message.indexOf(args[3])).trim())
                    .then(function(){
                        recv.sendMessage({
                            to: channel,
                            message: "Meme added."
                        });
                    })
                    .catch(function(err){
                        if (err.message.indexOf("duplicate")) {
                            recv.sendMessage({
                                to: channel,
                                message: "That meme already exists. Try a different name."
                            });
                        } else {
                            recv.sendMessage({
                                to: channel,
                                message: "Error adding meme: " + err
                            });
                        }
                    });
            }else{
                bot.database.getMeme(args[1].toLowerCase(), server)
                    .then(function(result){
                        if(result.length < 1){
                            recv.sendMessage({
                                to: channel,
                                message: ":bangbang: Meme not found, try !meme list"
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: result[0].meme
                            });
                        }
                    })
                    .catch(function(err){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: Error getting meme: "+err
                        });
                    });

            }
        }

    }
};