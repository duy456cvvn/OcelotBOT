/**
 * Created by Peter on 01/07/2017.
 */
//noinspection JSValidateTypes
/**
 * @type {Array}
 */
const responses = require("config").get("Commands.8ball.responses");
module.exports = {
    name: "Magic 8-ball",
    usage: "8ball <question>",
    accessLevel: 0,
    commands: ["8ball"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter a question!"
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: `:8ball: \`${bot.util.arrayRand(responses)}\``
            });
        }
    }
};