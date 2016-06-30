var musicChannels = [];

var musicChannel = {queueChannel: "", voiceChannel: "", queue: []};

exports.command = {
    name: "m2",
    desc: "Music bot",
    usage: "m q",
    func: function (user, userID, channel, args, message, bot) {
        bot.sendMessage({
            to: channel,
            message: " mmmmmusic pong"
        });

		//Allow a minimum of one argument
        if(args.length < 2)return false;




        return true;
    }
};


exports.init = function(bot){

}