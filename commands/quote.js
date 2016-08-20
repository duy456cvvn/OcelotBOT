/**
 * Created by Peter on 08/07/2016.
 */
var r = require('rethinkdb');
var dateformat = require('dateformat');
exports.command = {
    name: "quote",
    desc: "Get a random quote by a user",
    usage: "quote <username> [filter]",
    func: function(user, userID, channel, args, message, bot){

        if(args.length < 2)return false;

        if(args[2]){
            var sentence = message.substring(message.indexOf(args[2]));
            r.db('ocelotbot').table('messages').filter({user: args[1]}).filter(r.row('message').match(`\\b${sentence}\\b`)).sample(1).run(bot.rconnection, function(err, result){
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: "Error: "+err
                    });
                }else{
                    if(result[0] && result[0].message) {
                        var date = dateformat(new Date(result[0].time), "dd/mm/yy");
                        bot.sendMessage({
                            to: channel,
                            message: `> [${date}] <${result[0].user}> ${result[0].message}`
                        });
                    }else {
                        bot.sendMessage({
                            to: channel,
                            message: "Nothing found"
                        });
                    }
                }
            });
        }else{
            r.db('ocelotbot').table('messages').filter({user: args[1]}).sample(1).run(bot.rconnection, function(err, result){
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: "Error: "+err
                    });
                }else{
                    if(result[0] && result[0].message) {
                        var date = dateformat(new Date(result[0].time), "dd/mm/yy");
                        bot.sendMessage({
                            to: channel,
                            message: `> [${date}] <${result[0].user}> ${result[0].message}`
                        });
                    }else{
                        bot.sendMessage({
                            to: channel,
                            message: "Nothing found"
                        });
                    }
                }
            });
        }


        return true;
    }
};

