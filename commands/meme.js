const async = require('async');
exports.command = {
	name: "meme",
	desc: "Memes",
	usage: "meme <meme/list/add <name> <url>/globaladd <name> <url>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;
		var server = bot.isDiscord ? bot.servers[bot.channels[channel].guild_id] : {id: "slack"};
		var arg = args[1].toLowerCase();
		if(arg === "list") {
            bot.connection.query("SELECT name, server FROM stevie.ocelotbot_memes WHERE server = ? OR server = 'global';", [server.id], function (err, result) {
                if (err) {
                    bot.sendMessage({
                        to: channel,
                        message: "There was an error getting the meme list. Try again later.\n" + err
                    });
                } else {
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
                        if(bot.isDiscord) {
                            bot.sendMessage({
                                to: channel,
                                message: "**Available Memes:**\n__**Global** memes:__ " + globalMemes + "\n__**" + server.name + "** memes:__ " + serverMemes
                            });
                        }else{
                            bot.sendMessage({
                                to: channel,
                                message: "*Available Memes:*\n*Global* memes: " + globalMemes + "\n*Ocelotworks* memes: " + serverMemes
                            });
                        }
                    });
                }

            });
        }else if(arg === "remove"){
            bot.connection.query("DELETE FROM stevie.ocelotbot_memes WHERE `name` = ? AND addedby = ? AND (server = ? OR server = 'global') ORDER BY server LIMIT 1;", [args[2].toLowerCase(), userID, server.id], function (err, result) {
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: "Error removing meme: "+err
                    });
                }else{
                    if(result.affectedRows == 0){
                        bot.sendMessage({
                            to: channel,
                            message: "Meme doesn't exist or you didn't add it. Only the person who added it can remove it.\nIf you still want it removed, do !meme report "+args[2]
                        });
                    }else{
                        bot.sendMessage({
                            to: channel,
                            message: "Meme removed."
                        });
                    }
                }
            });
        }else if(arg === "report") {
            bot.sendMessage({
                to: "139871249567318017",
                message: `Meme report: ${message}\nFrom: ${userID}\nIn ${channel}/${server.name}`
            }, function(){
                bot.sendMessage({
                    to: channel,
                    message: "Meme reported successfully."
                });
            });
		}else if(arg === "add") {
            if (args.length < 4)return false;
            bot.connection.query("INSERT INTO `stevie`.`ocelotbot_memes` (`name`,`addedby`, `meme`, `server`) VALUES (?,?,?,?);", [args[2].toLowerCase(), userID, message.substring(message.indexOf(args[3])).trim(), server.id], function (err, result) {
                if (err) {
                    if (err.message.indexOf("duplicate")) {
                        bot.sendMessage({
                            to: channel,
                            message: "That meme already exists. Try a different name."
                        });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: "Error adding meme: " + err
                        });
                    }
                } else {
                    bot.sendMessage({
                        to: channel,
                        message: "Meme added."
                    });
                }
            });
        }else if(arg === "addglobal"){
            bot.connection.query("INSERT INTO `stevie`.`ocelotbot_memes` (`name`,`addedby`, `meme`, `server`) VALUES (?,?,?,?);", [args[2].toLowerCase(), userID, message.substring(message.indexOf(args[3])).trim(), "global"], function (err, result) {
                if (err) {
                    if (err.message.indexOf("duplicate")) {
                        bot.sendMessage({
                            to: channel,
                            message: "That meme already exists. Try a different name."
                        });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: "Error adding meme: " + err
                        });
                    }
                } else {
                    bot.sendMessage({
                        to: channel,
                        message: "Meme added."
                    });
                }
            });
		}else{
			bot.connection.query("SELECT `meme` FROM stevie.ocelotbot_memes WHERE `name` = ? AND (server = ? OR server = 'global') ORDER BY server;", [args[1].toLowerCase(), server.id], function (err, result) {
				if(err){
					bot.sendMessage({
						to: channel,
						message: "Error getting meme: "+err
					});
				}else{
					if(result.length < 1){
						bot.sendMessage({
							to: channel,
							message: "Meme not found, try !meme list"
						});
					}else{
					    if(bot.isDiscord && result[0].meme.indexOf("imgur") > -1){
					        bot.sendMessage({
                                to: channel,
                                message: "",
                                embed: {
                                    image: {
                                        url: result[0].meme
                                    }
                                }
                            });
                        }else{
                            bot.sendMessage({
                                to: channel,
                                message: result[0].meme
                            });
                        }
					}
				}
			});
		}	
	  	return true;
	}
};