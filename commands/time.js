/**
 * Created by Peter on 02/07/2016.
 */
exports.command = {
    name: "time",
    desc: "The time ime",
    usage: "time",
    func: function(user, userID, channel, args, message, bot){
        var now = new Date();
        bot.sendMessage({
        	to: channel,
        	message: `The time is *${(now.getHours()<10?'0':'')+now.getHours()}:${(now.getMinutes()<10?'0':'') +now.getMinutes()}:${(now.getSeconds()<10?'0':'')+now.getSeconds()}*`
        });

        return true;
    }
};

