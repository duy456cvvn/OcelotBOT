/**
 * Created by Peter on 22/06/2017.
 */
const gm = require('gm');
const fs = require('fs');
const request = require('request');
exports.command = {
    name: "crush",
    desc: "Have a crush on another user",
    usage: "crush [user/url]",
    func: function(user, userID, channel, args, message, bot){
        if(!args[1])return false;
        var target = args[1].replace(/[!@<>]/g, "");
        var isUrl = target.startsWith("http");
        if(bot.isDiscord && !isUrl && !bot.users[target]){
            bot.sendMessage({
                to: channel,
                message: "Couldn't find user, did you make sure to @mention them?"
            });
        }else{
            if(bot.isDiscord)
                bot.simulateTyping(channel);
            var fileName = "temp/avatar-"+encodeURIComponent(target)+".png";
            var outputFile = "temp/crush-"+encodeURIComponent(target)+".png";
            if(fs.existsSync(outputFile)){
                if(bot.isDiscord){
                    bot.uploadFile({
                        to: channel,
                        file: outputFile,
                        filename: "crush.png"
                    }, function(err){
                        if(err){
                            fs.unlink(outputFile, function(err){
                                if(err){
                                    bot.error("There was an error trying to delete "+outputFile+": "+err);
                                }else{
                                    bot.log("Deleted "+outputFile);
                                }
                            });
                        }
                    });
                }else{
                    bot.web_p.files.upload("crush.png", {
                        file: fs.createReadStream(outputFile),
                        channels: channel,
                        filetype: "png"
                    });
                }
            }else if(fs.existsSync(fileName)){
                makeMeme();
            }else{
                if(isUrl){
                    request(target).on("end", makeMeme).pipe(fs.createWriteStream(fileName));
                }else if(bot.isDiscord){
                    var targetUser = bot.users[target];
                    request(`https://cdn.discordapp.com/avatars/${target}/${targetUser.avatar}.png?size=256`).on("end", makeMeme).pipe(fs.createWriteStream(fileName));
                }else{
                    bot.web_p.users.profile.get({
                        user: target
                    }, function(err, details){
                        if(err){
                            bot.sendMessage({
                                to: channel,
                                message: "Err: "+err
                            });
                        }else{
                            request(details.profile.image_512).on("end", makeMeme).pipe(fs.createWriteStream(fileName));
                        }
                    });
                }

            }

            function makeMeme(){
                gm(fileName)
                    .resize(405)
                    .rotate("black", -4.7)
                    .extent(600, 875, "-128-455")
                    .toBuffer('PNG', function(err, buffer){
                        if(err){
                            bot.sendMessage({
                                to: channel,
                                message: "err: "+err
                            });
                            fs.unlink(fileName, function(err){
                                if(err){
                                    bot.error("There was an error trying to delete "+fileName+": "+err);
                                }else{
                                    bot.log("Deleted "+fileName);
                                }
                            });
                        }else{
                            gm(buffer)
                                .composite("static/crush.png")
                                .toBuffer('PNG', function(err, buffer){
                                    if(err){
                                        bot.sendMessage({
                                            to: channel,
                                            message: "err: "+err
                                        });
                                        fs.unlink(fileName, function(err){
                                            if(err){
                                                bot.error("There was an error trying to delete "+fileName+": "+err);
                                            }else{
                                                bot.log("Deleted "+fileName);
                                            }
                                        });
                                    }else{
                                        if(bot.isDiscord){
                                            bot.uploadFile({
                                                to: channel,
                                                file: buffer,
                                                filename: "crush.png"
                                            });
                                        }else{
                                            bot.web_p.files.upload("crush.png", {
                                                content: buffer,
                                                channels: channel,
                                                filetype: "png"
                                            });
                                        }
                                        fs.writeFile(outputFile, buffer, function(err){
                                            bot.warn("Error caching crush file: "+err);
                                        }, function(err, resp){
                                            bot.sendMessage({
                                                to: channel,
                                                message: JSON.stringify(resp)
                                            });
                                            if(err){
                                                bot.sendMessage({
                                                    to: channel,
                                                    message: err
                                                })
                                            }
                                        });
                                    }
                                });
                        }
                    });
            }


        }


        return true;
    }
};