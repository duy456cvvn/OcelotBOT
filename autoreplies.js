/**
 * Created by Peter on 07/07/2016.
 */
var request = require('request');
var markov = require('markov');
var async = require('async');

module.exports = function(bot) {
    return {
        name: 'Autoreplies Listener',
        init: function(callback) {
            var seeded = false,
                m = markov();

            // bot.log('Generating markov chain');
            // bot.connection.query('SELECT message FROM Messages ORDER BY RAND() LIMIT 250', function(err, result) {
            //     if(err) {
            //         bot.error(`Error: ${err}`);
            //     } else {
            //         bot.log('Retrieved messages');
            //         async.eachSeries(result, function(row, cb) {
            //             m.seed(row.message, cb);
            //         }, function() {
            //             bot.log('Finished seeding');
            //         });
            //     }
            // });

            bot.registerMessageHandler("autoreply", function(message, channelID, user, userID, event) {
                if(message.startsWith("<@U1M9SE59T>") || message.indexOf("<@!146293573422284800>") > -1) {
                    if(message == "<@U1M9SE59T> toggle markov") {
                        seeded = !seeded;
                    }

                    if(seeded) {
                        setTimeout(function() {
                            bot.sendMessage({
                                to: channelID,
                                message: m.respond(message, 500).join(" ")
                            });
                        }, Math.random()*500);

                    } else {
                        request({
                            url: 'https://www.reddit.com/r/gonewild/comments.json',
                            headers: {
                                'User-Agent': 'OcelotBOT link parser by /u/UnacceptableUse'
                            }
                        }, function(err, resp, body) {
                            if(err) {
                                bot.log(err);
                            } else {
                                try {
                                    var data = JSON.parse(body);
                                    if(data && data.data && data.data.children && data.data.children.length > 1) {
                                        bot.sendMessage({
                                            to: channelID,
                                            message: data.data.children[parseInt(Math.random() * data.data.children.length)].data.body
                                        });
                                    }
                                } catch(e) {
                                    bot.log(e);
                                }
                            }
                        });
                    }
                }

                message = message.toLowerCase();


                // if(message.indexOf("ass") > -1 && message.toLowerCase().indexOf("-") === -1) {
                //     var words = message.toLowerCase().split(" ");
                //     for(var i in words) {
                //         if(words.hasOwnProperty(i)) {
                //             if(words[i] === "ass" && words.length > parseInt(i)+1){
                //                 bot.sendMessage({
                //                     to: channelID,
                //                     message: "*ass-"+words[parseInt(i)+1]+"*"
                //                 });
                //                 break;
                //             }
                //         }
                //     }
                // }

                var ogIndex = message.indexOf("ack");
                if(ogIndex > -1 && (ogIndex > 0 ? message.indexOf(" ack ") > -1 : true)) { //ack test
                    var index = message.indexOf("ack ")+4; //4
                    var newBit = message.substring(index); //test
                    newBit = newBit.split(" ")[0]; //test
                    bot.sendMessage({
                        to: channelID,
                        message: "`syn "+newBit+"`"
                    })
                }

                if(message.indexOf("whoop there it is") > -1) {
                    bot.sendMessage({
                        to: channelID,
                        message: "_*WHO THE FUCK SAID THAT?*_"
                    });
                }
                if(message === "test") {

                    bot.sendMessage({
                        to: channelID,
                        message: "icles"
                    });
                }
                if(message.indexOf("too hot") > -1) {
                    bot.sendMessage({
                        to: channelID,
                        message: "*hot damn*"
                    });
                }

                if(message.indexOf("alot") > -1) {
                    bot.sendMessage({
                    	to: channelID,
                    	message: "http://thewritepractice.com/wp-content/uploads/2012/05/Alot-vs-a-lot1-600x450.png"
                    });
                }
                if(message === "the more you know"){
                    bot.addReaction({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "🌈",
                        reactionName: "rainbow"
                    }, function(){
                        setTimeout(function(){
                            bot.addReaction({
                                channelID: channelID,
                                messageID: event.d ? event.d.id : event.ts,
                                reaction: "⭐",
                                reactionName: "star"
                            });
                        }, 200);
                    });
                }

                if(message.indexOf("shit bot") > -1){
                    bot.addReaction({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "👎",
                        reactionName: "thumbsdown"
                    });
                }

                if(message.indexOf("peter") > -1 && bot.isDiscord){

                    bot.sendMessage({
                        to: channelID,
                        message: "<:peter:321679281061363712>"
                    });
                }
            });

            if(callback) {
                callback();
            }
        }
    };
};