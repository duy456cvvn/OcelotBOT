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
        	message: `The last crash was *${prettySeconds(timeDiff)}* ago. (${bot.lastCrash.getDate()}/${bot.lastCrash.getMonth()+1}/${bot.lastCrash.getFullYear()})`
        });


        return true;
    },
    test: function(test){
        test.cb('lastcrash', function(t){
            var bot = {};
            bot.lastCrash = new Date();
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("*00:00:00* ago") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["lastcrash"], "", bot));
        });
    }
};

function quantify(data, unit, value) {
    if (value) {
        if (value > 1 || value < -1)
            unit += 's';

        data.push(value + ' ' + unit);
    }

    return data;
}

function prettySeconds(seconds) {

    var prettyString = '',
        data = [];

    if (typeof seconds === 'number') {

        data = quantify(data, 'day',    parseInt(seconds / 86400));
        data = quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
        data = quantify(data, 'minute', parseInt((seconds % 3600) / 60));
        data = quantify(data, 'second', Math.floor(seconds % 60));

        var length = data.length,
            i;

        for (i = 0; i < length; i++) {

            if (prettyString.length > 0)
                if (i == length - 1)
                    prettyString += ' and ';
                else
                    prettyString += ', ';

            prettyString += data[i];
        }
    }

    return prettyString;
};



