exports.command = {
    name: "unnoot",
    desc: "desc",
    usage: "usage",
    func: function (user, userID, channel, args, message, bot) {
        bot.sendMessage({
            to: channel,
            message: "Un-nooted."
        });
        bot.getAudioContext({ channel: "144926385834688514", stereo: true}, function(stream) {
            stream.stopAudioFile();
        });

        return true;
    }
};