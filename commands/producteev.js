/**
 * Created by Peter on 24/04/2016.
 */
exports.command = {
    name: "test",
    desc: "A test command",
    usage: "test",
    func: function(user, userID, channel, args, message, bot){
        bot.sendMessage({
            to: channel,
            message: "pong"
        });
        return true;
    }
};