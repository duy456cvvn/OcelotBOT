/**
 * Created by Peter on 06/06/2017.
 */
exports.command = {
    name: "flip",
    desc: "Flips a  coin",
    usage: "flip",
    func: function(user, userID, channel, args, message, bot){

        bot.sendMessage({
           to: channel,
            message: Math.random() > 0.5 ? ":full_moon: HEADS!" : ":new_moon: TAILS!"
        });

        return true;
    }
};