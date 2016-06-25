exports.command = {
    name: "join",
    desc: "Join a server/channel",
    usage: "join <invite>",
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2)return false;
        bot.acceptInvite(args[1], function(err, resp){
            if(err){
                bot.sendMessage({
                    to: channel,
                    message: "**Error accepting invite: ** "+err.message
                });
            }else{
                console.log(resp);
                bot.sendMessage({
                    to: channel,
                    message: "Accepted invite"
                });
            }

        });

        return true;
    }
};