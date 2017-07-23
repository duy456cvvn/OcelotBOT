/**
 * Created by Peter on 20/07/2017.
 */

const release = new Date("4 August 2017");

const numbers = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
];

module.exports = {
    name: "Emoji Movie Countdown",
    usage: "emoji",
    accessLevel: 0,
    commands: ["emoji", "emojicountdown", "emojimovie"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {


        var now = new Date();
        var countdown = (parseInt((release-now)/1000/60/60/24)+1)+"";

        var output = "";

        for(var i = 0; i < countdown.length; i++){
            var num = countdown[i];
            if(numbers[num])
                output += ":"+numbers[num]+":";
        }

        recv.sendMessage({
            to: channel,
            message: ":rofl: :ok_hand: :100: Only "+output+" days until 2017s biggest blockbuster hit, The Emoji Movie, hits the cinemas!"
        });

    }
};