/**
 * Created by Peter on 02/06/2017.
 */
exports.command = {
    name: "expand",
    desc: "E X P A N D S",
    usage: "expand",
    func: function(user, userID, channel, args, message, bot){

        bot.sendMessage({
            to: channel,
            message:  message.replace("!expand", "").split("").join(" ")
        });

        return true;
    }
};