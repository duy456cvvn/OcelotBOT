/**
 * Created by Peter on 05/12/2016.
 */
const fs = require('fs');
exports.command = {
    name: "msemb",
    desc: "Messags Before Ethan Mentions Bri",
    usage: "mbemb [messages]",
    func: function(user, userID, channel, args, message, bot){
        var ethan = {total: 0, record: 0, count: 0};

        fs.readFile('ethan.json', function(err, data) {
            if (err) {
                bot.sendMessage({
                    to: channel,
                    message: "Couldn't open file. " + err
                });
            } else {
                ethan = JSON.parse(data);

                if (args[1]) {
                    ethan.count++;
                    var amount = parseInt(args[1]);
                    ethan.total += amount;
                    if (amount > ethan.record) {
                        bot.sendMessage({
                            to: channel,
                            message: ":ethan: Damn, bro... Just broke a record streak of `" + ethan.record + "` messages."
                        });
                        ethan.record = amount;
                    }else{
                        bot.sendMessage({
                            to: channel,
                            message: ":ethan: New Average is "+ethan.total/ethan.count+" :ethan:"
                        });
                    }

                    fs.writeFile("ethan.json", JSON.stringify(ethan), function (err) {
                        if (err) {
                            bot.sendMessage({
                                to: channel,
                                message: "Couldn't reset: " + err
                            });
                        }
                    });
                } else {
                    bot.sendMessage({
                        to: channel,
                        message: `:ethan: On average, Ethan sends *${ethan.total / ethan.count}* messages before mentioning his _girlfriend_, Bri. The record number of messages is ${ethan.record}`
                    });
                }
            }
        });
        return true;
    }
};