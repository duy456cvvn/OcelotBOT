/**
 * Created by Peter on 03/07/2016.
 */
exports.command = {
    name: "lastcrash",
    desc: "How long since last crash",
    usage: "lastcrash",
    func: function(user, userID, channel, args, message, bot){

        var now = new Date().getTime();

        var timeDiff = Math.abs(now - bot.lastCrash.getTime())/1000;

        bot.sendMessage({
        	to: channel,
        	message: `The last crash was *${this.toHHMMSS(timeDiff)}* ago. (${bot.lastCrash.getDate()}/${bot.lastCrash.getMonth()+1}/${bot.lastCrash.getFullYear()})`
        });


        return true;
    },
    toHHMMSS: function (input) {
        var sec_num = parseInt(input, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    }
};

