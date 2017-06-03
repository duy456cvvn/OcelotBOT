/**
 * Created by Peter on 03/06/2017.
 */
exports.command = {
    name: "invite",
    desc: "Gets an invite link for you.",
    usage: "invite",
    func: function(user, userID, channel, args, message, bot){
       bot.sendMessage({
           to: channel,
           message: bot.isDiscord ? "https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=36785216" : "Invites not supported yet"
       });
        return true;
    }
};