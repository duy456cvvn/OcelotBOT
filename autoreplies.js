/**
 * Created by Peter on 07/07/2016.
 */
var request = require('request');
var markov = require('markov');
var async = require('async');


const alots = {
    "care about this alot": "https://3.bp.blogspot.com/_D_Z-D2tzi14/S8TTPQCPA6I/AAAAAAAACwA/ZHZH-Bi8OmI/s400/ALOT2.png",
    "alot of fire": "https://3.bp.blogspot.com/_D_Z-D2tzi14/S8TWUJ0APWI/AAAAAAAACwI/014KRxexoQ0/s320/ALOT3.png",
    "alot of mist": "https://3.bp.blogspot.com/_D_Z-D2tzi14/S8TWtWhXOfI/AAAAAAAACwQ/vCeUMPnMXno/s320/ALOT9.png",
    "alot of straw": "https://3.bp.blogspot.com/_D_Z-D2tzi14/S8TW0Y2bL_I/AAAAAAAACwY/MGdywFA2tbg/s320/ALOT8.png",
    "alot of cans": "https://1.bp.blogspot.com/_D_Z-D2tzi14/S8TZcKXqR-I/AAAAAAAACwg/F7AqxDrPjhg/s320/ALOT13.png",
    "alot of beer": "https://1.bp.blogspot.com/_D_Z-D2tzi14/S8TZcKXqR-I/AAAAAAAACwg/F7AqxDrPjhg/s320/ALOT13.png",
    "sad alot": "https://2.bp.blogspot.com/_D_Z-D2tzi14/S8Tdnn-NE0I/AAAAAAAACww/khYjZePN50Y/s400/ALOT4.png",
    "charging alot": "https://4.bp.blogspot.com/_D_Z-D2tzi14/S8TfVzrqKDI/AAAAAAAACw4/AaBFBmKK3SA/s320/ALOT5.png",
    "hear that alot": "https://2.bp.blogspot.com/_D_Z-D2tzi14/S8TiTtIFjpI/AAAAAAAACxQ/HXLdiZZ0goU/s320/ALOT14.png",
    "get that alot": "https://2.bp.blogspot.com/_D_Z-D2tzi14/S8TiTtIFjpI/AAAAAAAACxQ/HXLdiZZ0goU/s320/ALOT14.png",
    "like this alot": "https://3.bp.blogspot.com/_D_Z-D2tzi14/S8TffVGLElI/AAAAAAAACxA/trH1ch0Y3tI/s320/ALOT6.png",
    "alot more dangerous": "https://1.bp.blogspot.com/_D_Z-D2tzi14/S8TflwXvTgI/AAAAAAAACxI/qgd1wYcTWV8/s320/ALOT12.png",
    "alot": "https://4.bp.blogspot.com/_D_Z-D2tzi14/S8TRIo4br3I/AAAAAAAACv4/Zh7_GcMlRKo/s400/ALOT.png"
};

var alotRateLimit = {};

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
                    var now = new Date();
                    if(!alotRateLimit[channelID] || now-alotRateLimit[channelID] > 500){
                        for(var i in alots){
                            if(message.indexOf(i) > -1){
                                if(bot.isDiscord){
                                    bot.sendMessage({
                                        to: channelID,
                                        message: "",
                                        embed:{
                                            image: {
                                                url: alots[i]
                                            }
                                        }
                                    });
                                }else{
                                    bot.sendMessage({
                                        to: channelID,
                                        message: alots[i]
                                    });
                                }
                                break;
                            }
                        }
                        alotRateLimit[channelID] = now;
                    }

                }
                if(message === "the more you know"){

                    bot.spellQueue.push({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "🌈",
                        reactionName: "rainbow",
                        time: new Date()
                    });
                    bot.spellQueue.push({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "⭐",
                        reactionName: "star",
                        time: new Date()
                    });
                    bot.processSpellQueue();
                }

                if(message.indexOf("shit bot") > -1){
                    bot.spellQueue.push({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "👎",
                        reactionName: "thumbsdown",
                        time: new Date()
                    });
                    bot.processSpellQueue();
                }

                if(message.indexOf("xd") > -1){
                    bot.spellQueue.push({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "🇽",
                        reactionName: "x",
                        time: new Date()
                    });
                    bot.spellQueue.push({
                        channelID: channelID,
                        messageID: event.d ? event.d.id : event.ts,
                        reaction: "🇩",
                        reactionName: "d",
                        time: new Date()
                    });
                    bot.processSpellQueue();
                }

            });

            if(callback) {
                callback();
            }
        }
    };
};