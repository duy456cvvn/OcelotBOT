/**
 * Created by Peter on 07/07/2016.
 */
var request = require('request');
module.exports = function(bot){
    return {
        name: "Autoreplies Listener",
        init: function(cb){

            bot.registerMessageHandler("autoreply", function handleAutoReply(message, channelID){

                if(message.startsWith("<@U1M9SE59T>")){
                    request({
                        url: 'https://www.reddit.com/r/gonewild/comments.json',
                        headers: {
                            'User-Agent': 'OcelotBOT link parser by /u/UnacceptableUse'
                        }
                    }, function sexyResponse(err, resp, body){
                        if(err){
                           bot.log(err);
                        }else{
                            try {
                                var data = JSON.parse(body);
                                if(data && data.data && data.data.children && data.data.children.length > 1){
                                    bot.sendMessage({
                                        to: channelID,
                                        message: data.data.children[parseInt(Math.random() * data.data.children.length)].data.body
                                    });
                                }
                            }catch(e){
                                bot.log(e);
                            }
                        }
                    });
                }

                message = message.toLowerCase();


                if(message.indexOf("ass") > -1 && message.toLowerCase().indexOf("-") === -1){
                    var words = message.toLowerCase().split(" ");
                    for(var i in words){
                        if(words.hasOwnProperty(i)){
                            if(words[i] === "ass" && words.length > parseInt(i)+1){
                                bot.sendMessage({
                                    to: channelID,
                                    message: "*ass-"+words[parseInt(i)+1]+"*"
                                });
                                break;
                            }
                        }
                    }
                }
                var ogIndex = message.indexOf("ack");
                if(ogIndex > -1 && (ogIndex > 0 ? message.indexOf(" ack ") > -1 : true)){ //ack test
                    var index = message.indexOf("ack ")+4; //4
                    var newBit = message.substring(index); //test
                    newBit = newBit.split(" ")[0]; //test
                    bot.sendMessage({
                        to: channelID,
                        message: "`syn "+newBit+"`"
                    })
                }

                if(message.indexOf("whoop there it is") > -1){
                    bot.sendMessage({
                        to: channelID,
                        message: "_*WHO THE FUCK SAID THAT?*_"
                    });
                }
                if (message === "test") {
                    bot.sendMessage({
                        to: channelID,
                        message: "icles"
                    });
                }
                if(message.indexOf("too hot") > -1){
                    bot.sendMessage({
                        to: channelID,
                        message: "*hot damn*"
                    });
                }

                if(message.indexOf("alot") > -1){
                    bot.sendMessage({
                    	to: channelID,
                    	message: "http://thewritepractice.com/wp-content/uploads/2012/05/Alot-vs-a-lot1-600x450.png"
                    });
                }
            });

            if(cb)
                cb();
        }
    };
};