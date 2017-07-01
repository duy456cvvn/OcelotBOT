/**
 * Created by Peter on 01/07/2017.
 */
const   gm      = require('gm'),
        fs      = require('fs'),
        request = require('request'),
        config  = require('config').get("Commands.crush");

module.exports = {
    name: "Crush",
    usage: "crush <user/url>",
    accessLevel: 0,
    commands: ["crush"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(!args[1]){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must mention a user, or enter a URL."
            });
        }else{
            const target = args[1].replace(/[!@<>]/g, "");
            const isUrl = target.startsWith("http");
            if(!isUrl && !recv.getUser(target)){
                recv.sendMessage({
                    to: channel,
                    message: ":bangbang: Couldn't find that user, did you make sure to @mention them?"
                });
            }else{
                recv.simulateTyping(channel);
                const fileName = `${config.get("dir")}avatar-${encodeURIComponent(target)}.png`;
                const outputFile = `${config.get("dir")}crush-${encodeURIComponent(target)}.png`;
                if(fs.existsSync(outputFile)){
                    bot.log("Using cached crush file");
                    recv.uploadFile({
                        to: channel,
                        file: outputFile,
                        filename: config.get("filename"),
                        filetype: "png"
                    }, function uploadFileCB(err){
                        if(err){
                            fs.unlink(outputFile, function deleteFileCB(err){
                                if(err){
                                    bot.error(`There was an error trying to delete ${outputFile}: ${err}`);
                                }else{
                                    bot.log(`Deleted ${outputFile}`);
                                }
                            });
                            recv.sendMessage({
                                to: channel,
                                message: ":bangbang: Something went wrong. Try again later."
                            })
                        }
                    });
                }else if(fs.existsSync(fileName)){
                    bot.log("Using cached avatar file");
                    makeMeme();
                }else if(isUrl){
                    request(target).on("end", makeMeme).pipe(fs.createWriteStream(fileName));
                }else if(recv.id === "discord"){
                    var targetUser = recv.getUser(target);
                    bot.log(`Downloading avatar of ${target} (${targetUser.avatar})`);
                    request(`https://cdn.discordapp.com/avatars/${target}/${targetUser.avatar}.png?size=256`)
                        .on("end", makeMeme)
                        .pipe(fs.createWriteStream(fileName));
                }else{
                    //TODO
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: This platform isn't supported yet."
                    });
                }

                function makeMeme(){
                    gm(fileName)
                        .resize(405)
                        .rotate("black", -4.7)
                        .extent(600, 875, "-128-455")
                        .toBuffer('PNG', function avatarToBuffer(err, buffer){
                            if(err){
                                recv.sendMessage({
                                    to: channel,
                                    message: ":bangbang: There was an error processing the image. Maybe the URL is invalid, or the user is unavailable for some reason..."
                                });
                                bot.error(`Error during avatar format stage of !crush: ${err.stack}`);
                                fs.unlink(fileName, function(err){
                                    if(err){
                                        bot.error("There was an error trying to delete "+fileName+": "+err);
                                    }else{
                                        bot.log("Deleted "+fileName);
                                    }
                                });
                            }else{
                                gm(buffer)
                                    .composite(config.get("template"))
                                    .toBuffer('PNG', function crushToBuffer(err, buffer){
                                        if(err){
                                            recv.sendMessage({
                                                to: channel,
                                                message: ":bangbang: There was an error processing the image. Maybe the URL is invalid, or the user is unavailable for some reason..."
                                            });
                                            bot.error(`Error during composite stage of !crush: ${err.stack}`);
                                            fs.unlink(fileName, function(err){
                                                if(err){
                                                    bot.error(`There was an error trying to delete ${fileName}: ${err}`);
                                                }else{
                                                    bot.log(`Deleted ${fileName}`);
                                                }
                                            });
                                        }else{
                                            recv.uploadFile({
                                                to: channel,
                                                file: buffer,
                                                filename: config.get("filename"),
                                                filetype: "png"
                                            });
                                            fs.writeFile(outputFile, buffer, function(err){
                                                bot.warn(`Error caching crush file: ${err}`);
                                            }, function(err){
                                                if(err){
                                                    recv.sendMessage({
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

        }
    }
};