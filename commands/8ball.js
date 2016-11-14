/**
 * Created by Peter on 11/11/2016.
 */



var responses = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes, definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful"
];
exports.command = {
    name: "8ball",
    desc: "Consult the magic 8 ball for life advice",
    usage: "8ball <question>",
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2)return false;
        bot.sendMessage({
            to: channel,
            message: "`"+responses[parseInt(Math.random() * responses.length)]+"`"
        });
        return true;
    }
};