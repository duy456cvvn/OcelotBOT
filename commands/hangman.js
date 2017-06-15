/**
 * Created by Peter on 02/06/2017.
 */

exports.command = {
    name: "hangman",
    desc: "A nice game of hangman",
    usage: "hangman",
    func: function(user, userID, channel, args, message, bot){
        return true;
        bot.sendAttachment(channel, "", [{
            fallback: `\`____\` React with letters to guess.`,
            color: "#0da794",
            title: `\`_ _ _ _\``,
            text: "React with letters to guess."
        }]);

        return true;
    }
};