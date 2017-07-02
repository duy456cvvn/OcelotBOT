/**
 * Created by Peter on 01/07/2017.
 */
//noinspection JSValidateTypes
/**
 * @type {Array}
 */
const insults = require('config').get("Commands.insult.insults");
module.exports = {
    name: "Insult",
    usage: "insult <user>",
    accessLevel: 0,
    commands: ["insult"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        recv.sendMessage({
            to: channel,
            message: `${message.substring(8)}, ${bot.util.arrayRand(insults)}`
        });
    }
};