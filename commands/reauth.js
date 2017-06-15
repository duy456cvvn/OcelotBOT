/**
 * Created by Peter on 13/04/2017.
 */
exports.command = {
    name: "reauth",
    desc: "Generate an auth URL",
    usage: "reauth [permission][",
    func: function(user, userID, channel, args, message, bot){
        if(bot.isDiscord)return true;

        bot.sendMessage({
            to: channel,
            message: `https://slack.com/oauth/pick?scope=${encodeURIComponent(args[1])}&client_id=${bot.config.slack.clientId}`
        });
        return true;
    }
};