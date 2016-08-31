/***********************************************************
 *************** *************** *************** *************** *************** *************** *************** *************** **************************************** ********************* ********************* ************************************************************
 ** Copyright  UnacceptableUse*****UnacceptableUse.com
 *Created
 **/
var r = require('rethinkdb');
exports.command = {
    name: "poem",
    desc: "Get an urban dictionary definition",
    usage: "defineud <word>",
    func: function(user, userID, channel, args, message, bot){

        var messageID = 0;
        bot.sendMessage({
            to: channel,
            message: "Generating Poem (This will take forever)"
        }, function(err, resp){
            if(!err)
                messageID = resp.ts;
        });

        r.db('ocelotbot').table('messages').filter(function(message){
            return message("message").match(".*([to]o|u|[uei]w|2)$").and(r.gt(message('message').split(" ").count(), 5))
        }).sample(1).pluck("message", "user", "time").run(bot.rconnection, function(err, res){
           if(err){
               bot.editMessage({
                   channel: channel,
                   messageID: messageID,
                   message: "Error: "+err
               });
           } else{
               bot.editMessage({
                   channel: channel,
                   messageID: messageID,
                   message: "Roses are red\nViolets are blue\n>"+res[0].message+"\n - "+res[0].user+" "+new Date(res[0].time).getFullYear()
               });
           }
        });
        return true;
    }
};
