/*
* Copyright UnacceptableUse 2016
 */

var poemMatch = /(.*) (.*)Roses are red\\nViolets are blue\\n>(.*)\\n - (.*) [0-9]{4}/;
var r = require('rethinkdb');
exports.command = {
    name: "context",
    desc: "Get the context of a ",
    usage: "context [message].",
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2){
            bot.web_p.channels.history(channel, {count: 40}, function(err, resp){
                if(err || !resp.ok){
                    if(!resp.ok && resp.error === "missing_scope"){
                        bot.sendMessage({
                            to: channel,
                            message: JSON.stringify(resp)
                        });
                        bot.sendMessage({
                            to: channel,
                            message: "The bot needs to be granted the permission `"+resp.needed+"` to use this command without arguments."
                        });
                    }else
                        bot.sendMessage({
                            to: channel,
                            message: "Couldn't retrieve messages "+(err ? err : JSON.stringify(resp))
                        });
                }else{
                    var messages = resp.messages;
                    for(var i in messages)
                        if(messages.hasOwnProperty(i)){
                            var message = messages[i];
                            if(message.user == "U1M9SE59T"){ //TODO: get this dynamically
                                bot.log("Found a message from OcelotBOT: "+message.text);
                                if(message.text.startsWith("Roses are red")){
                                    bot.log("Found a valid poem");
                                    var match = JSON.stringify(message.text).match(poemMatch);
                                    bot.log(message.text+" * "+JSON.stringify(match));
                                    if(match && match.length > 0){
                                        var text = match[1];
                                        var user = match[2];
                                        bot.log("Matched it, trying to find it in the database...");
                                        r.db('ocelotbot').table('messages').filter({message: text, user: user}).limit(1).run(bot.rconnection, function(err, result){
                                           if(err){
                                               bot.sendMessage({
                                                to: channel,
                                                message: `Error getting original message timestamp from message <${user}> ${text}\n${err}`
                                               });
                                           }else{
                                                if(result && result.time){
                                                    bot.log("Found it! Trying to find some context...");
                                                    r.db('ocelotbot').table('messages').filter(function(message){
                                                        return message('time').le(result.time+20000).and(message('time').ge(result.time-20000))
                                                    }).orderBy('time').run(bot.rconnection, function(err, result){
                                                       if(err){
                                                           bot.sendMessage({
                                                           	to: channel,
                                                           	message: "Error getting context: "+err
                                                           });
                                                       } else{
                                                           bot.log("Found some context. fuckin woo");
                                                           var output = "```\n";
                                                           result.eachAsync(function(err, row){
                                                              if(err){
                                                                  output += "*error: "+err+"*\n"
                                                              } else{
                                                                  if(row.message == text)
                                                                      output += `*<${row.user}> ${row.message}*\n`;
                                                                  else
                                                                     output += `<${row.user}> ${row.message}\n`;
                                                              }
                                                           }, function(){
                                                               output += "```";
                                                               bot.sendMessage({
                                                               	to: channel,
                                                               	message: output
                                                               });
                                                           });
                                                       }
                                                    });
                                                }else{
                                                    bot.sendMessage({
                                                    	to: channel,
                                                    	message: "Could not determine timestamp for message. ("+(result ? result.id : "no result")+")"
                                                    });
                                                }
                                           }
                                        });
                                    }else{
                                        bot.sendMessage({
                                        	to: channel,
                                        	message: "Could not match message to poem regex: "+JSON.stringify(message.text)
                                        });
                                    }
                                    break;
                                }
                            }
                        }
                }
            });
        }
        return true;
    }
};