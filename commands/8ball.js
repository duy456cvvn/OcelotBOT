/**
 * Created by Peter on 11/11/2016.
 */

exports.command = {
    name: "8ball",
    desc: "Consult the magic 8 ball for life advice",
    usage: "8ball <question>",
    func: function(user, userID, channel, args, message, bot){
        const responses = bot.config["8ball"];
        if(args.length < 2)return false;
        bot.sendMessage({
            to: channel,
            message: "`"+responses[parseInt(Math.random() * responses.length)]+"`"
        });
        return true;
    }
};