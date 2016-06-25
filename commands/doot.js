//FIXME: re-implement with radio
var fs = require('fs');
exports.command = {
    name: "doot",
    desc: "desc",
    usage: "usage",
    func: function (user, userID, channel, args, message, bot) {
        bot.leaveVoiceChannel(bot.nspChannel, function(){
            bot.joinVoiceChannel("144926385834688514", function(){
                bot.getAudioContext({ channel: "144926385834688514", stereo: true}, function(stream) {
                    fs.readdir('/home/peter/doot', function(err, files){
                        if(err){
                            console.error("Could not access radio dir ");
                        }else{
                            var file = files[args[1]];
                            var path = '/home/peter/doot/'+file;
                            stream.playAudioFile(path);
                        }
                    });
                    stream.once('fileEnd', function() {
                        bot.leaveVoiceChannel("144926385834688514", function(){
                            bot.joinVoiceChannel(bot.nspChannel);
                        });
                    });
                });
            });
        });

        return true;
    }
};