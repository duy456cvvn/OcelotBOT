var isNooting = false;
var fs = require('fs');
exports.command = {
    name: "noot",
    desc: "desc",
    usage: "usage",
    func: function (user, userID, channel, args, message, bot) {
        //if(isNooting){
        //    bot.sendMessage({
        //        to: channel,
        //        message: "A noot is already in progress."
        //    });
        //    return true;
        //}
        //bot.sendMessage({
        //    to: channel,
        //    message: "Nooted."
        //});
        //bot.leaveVoiceChannel(bot.nspChannel, function(){
        //    bot.joinVoiceChannel("144926385834688514", function(){
        //        bot.getAudioContext({ channel: "144926385834688514", stereo: true}, function(stream) {
        //            stream.playAudioFile("/home/www-data/files.unacceptableuse.com/noot.mp3");
        //            isNooting = true;
        //            stream.once('fileEnd', function() {
        //                bot.leaveVoiceChannel("144926385834688514", function(){
        //                    isNooting = false;
        //                    bot.joinVoiceChannel(bot.nspChannel);
        //                });
        //
        //            });
        //
        //        });
        //    });
        //});
        bot.leaveVoiceChannel(bot.nspChannel, function(){
            bot.joinVoiceChannel("144926385834688514", function(){
                bot.getAudioContext({ channel: "144926385834688514", stereo: true}, function(stream) {
                    fs.readdir('/home/peter/noot', function(err, files){
                        if(err){
                            console.error("Could not access radio dir ");
                        }else{
                            var file = files[Math.floor(Math.random() * files.length)];
                            var path = '/home/peter/noot/'+file;
                            stream.playAudioFile(path);
                        }
                    });
                    //To start playing an audio file, will stop when it's done.
                    //stream.stopAudioFile(); //To stop an already playing file
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