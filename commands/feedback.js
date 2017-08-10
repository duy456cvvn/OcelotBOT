/**
 * Created by Peter on 13/06/2017.
 */
module.exports = {
    name: "Leave Feedback",
    usage: "feedback [message]",
    accessLevel: 0,
    commands: ["feedback", "support"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args.length > 1){
            recv.sendMessage({
                to: channel,
                message: ":white_check_mark: Your feedback has been sent. Please note we cannot respond to all feedback."
            });
            recv.getServer(server, function(err, serverInfo){
                recv.sendMessage({
                    to: "344931831151329302",
                    message: `Feedback from ${userID} (${user}) in ${server} (${serverInfo ? serverInfo.name : "DM"}):\n${message}`
                });
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: `:bangbang: You must enter some feedback. i.e **${bot.prefixCache[server]}feedback This bot is amazing!**`
            })
        }
    }
};