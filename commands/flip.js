/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Coin Flip",
    usage: "flip",
    accessLevel: 0,
    commands: ["flip"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        recv.sendMessage({
            to: channel,
            message: Math.random() > 0.5 ? ":full_moon: HEADS!" : ":new_moon: TAILS!"
        });
    }
};