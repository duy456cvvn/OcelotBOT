/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Meme",
    usage: "meme <meme/list/add <name> <url>/globaladd <name> <url>",
    accessLevel: 0,
    commands: ["meme"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: Invalid usage. !meme <meme/list/add <name> <url>/globaladd <name> <url>>"
            });
        }else{
            const arg = args[1].toLowerCase();
        }

    }
};