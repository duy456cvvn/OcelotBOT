/**
 * Created by Peter on 07/07/2016.
 */

module.exports = function(bot){
    return {
        name: "Autoreplies Listener",
        init: function(cb){

            bot.registerMessageHandler("autoreply", function handleAutoReply(message, channelID){
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
            });

            if(cb)
                cb();
        }
    };
};