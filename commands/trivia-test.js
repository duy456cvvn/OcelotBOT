/**
 * Created by Peter on 30/06/2017.
 */
var request = require('request');
var async = require('async');
const columnify = require('columnify');
var questionsInProgress = [];
var correctAnswer = false;
var triviaSeconds = 15;

const difficulties = [
    "easy",
    "medium",
    "hard"
];

const difficultyColours = {
    easy: "#51ff81",
    medium: "#ff7d2d",
    hard: "#ff150e"
};

const numbers = [
    "one",
    "two",
    "three",
    "four"
];

exports.command = {
    name: "triviatest",
    desc: "Gives you a trivia question",
    usage: "trivia [leaderboards]",
    func: function(user, userID, channel, args, message, bot){

        if(args[1] && (args[1] === "stats" || args[1] === "leaderboard")){
            bot.connection.query("SELECT user, SUM(difficulty) as 'Score', COUNT(*) as 'correct', (SELECT COUNT(*) FROM trivia WHERE correct = '0') as 'incorrect' FROM trivia WHERE correct = '1' GROUP BY user ORDER BY Score DESC, correct DESC LIMIT 10", function(err, result){
                if(err){
                    bot.error(err);
                    bot.sendMessage({
                        to: channel,
                        message: err
                    });
                }else{
                    var data = [];
                    var i = 1;
                    async.eachSeries(result, function(entry, cb){
                        if(bot.isDiscord) {
                            data.push({
                                "#": i++,
                                "User": bot.users[entry.user] ? bot.users[entry.user].username + "#" + bot.users[entry.user].discriminator : "Unknown User " + entry.user,
                                "Score": entry.Score,
                                "Correct": entry.correct,
                            });
                        }else{
                            data.push({
                                "#": i++,
                                "User": "Discord User " + entry.user,
                                "Score": entry.Score,
                                "Correct": entry.correct,
                            });
                        }
                        cb();
                    }, function(){
                        bot.sendMessage({
                            to: channel,
                            message: "TOP 10 Trivia Players:\n```yaml\n"+columnify(data)+"\n```"
                        });
                    })

                }

            });

        }else if(questionsInProgress.indexOf(channel) > -1){
            bot.sendMessage({
                to: channel,
                message: "You can't start another question when one is already in progress. Vote with reactions!"
            });
        }else{
            request("https://opentdb.com/api.php?amount=1&encode=url3986", function(err, resp, body){
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: "Trivia service is currently unavailable ("+err+")"
                    })
                }else{
                   // questionsInProgress.push(channel);
                    try{
                        var data = JSON.parse(body);
                        if(data.results[0]){
                            var question = data.results[0];
                            var answers = question.incorrect_answers;
                            answers.push(question.correct_answer);
                            shuffle(answers);
                            var correctAnswer = question.correct_answer;
                            var isBoolean = question.type === "boolean";
                            var fields = [];

                            if(isBoolean){
                                fields = [
                                        {
                                            title: "For TRUE:",
                                            value: "React with :white_check_mark:",
                                            short: true
                                        },
                                        {
                                            title: "For FALSE:",
                                            value: "React with :negative_squared_cross_mark:",
                                            short: true
                                        }
                                    ];
                            }else{
                                for(var i in answers){
                                    fields.push({
                                        title: `For "${decodeURIComponent(answers[i])}":`,
                                        value: `React with :${numbers[i]}:`,
                                        short: true
                                    });
                                }
                            }

                            bot.sendAttachment(channel, `Category: *${decodeURIComponent(question.category)}*`, [{
                                fallback: `True/False: ${encodeURIComponent(question.question)}. React :white_check_mark: for true and :negative_squared_cross_mark: for false. You have ${triviaSeconds} seconds.`,
                                color: difficultyColours[question.difficulty],
                                title: bot.isDiscord ? `*You have ${triviaSeconds} seconds to answer.*\nTrue or False:` : `You have ${triviaSeconds} seconds to answer.\nTrue or False:`,
                                text: decodeURIComponent(question.question),
                                fields: fields

                            }], after(500, function(err, resp){
                                if(err){
                                    bot.error("Error sending trivia question: "+err);
                                    bot.sendMessage({
                                        to: channel,
                                        message: "Something went wrong. Try Again Later."
                                    });
                                }else{
                                    var id = resp.id || resp.ts;
                                    if(isBoolean){
                                        bot.spellQueue.push({
                                            channelID: channel,
                                            messageID: id,
                                            reaction: "✅",
                                            reactionName: "white_check_mark",
                                            time: new Date()
                                        });
                                        bot.spellQueue.push({
                                            channelID: channel,
                                            messageID: id,
                                            reaction: "❎",
                                            reactionName: "negative_squared_cross_mark",
                                            time: new Date()
                                        });
                                    }else{
                                        bot.spellQueue.push({
                                            channelID: channel,
                                            messageID: id,
                                            reactionName: "one",
                                            reaction: "1⃣",
                                            time: new Date()
                                        });
                                        bot.spellQueue.push({
                                            channelID: channel,
                                            messageID: id,
                                            reactionName: ":two:",
                                            reaction: "2⃣",
                                            time: new Date()
                                        });
                                        bot.spellQueue.push({
                                            channelID: channel,
                                            messageID: id,
                                            reaction: "3⃣",
                                            reactionName: "three",
                                            time: new Date()
                                        });
                                        bot.spellQueue.push({
                                            channelID: channel,
                                            messageID: id,
                                            reaction: "4⃣",
                                            reactionName: "four",
                                            time: new Date()
                                        });
                                    }
                                    bot.processSpellQueue();

                                    setTimeout(function(){
                                        bot.getMessage({
                                            channelID: channel,
                                            messageID: id
                                        }, function(err, resp){
                                            if(err){
                                                bot.sendMessage({
                                                    to: channel,
                                                    message: "Something went wrong... we'll never know who won...\n```\n"+err.message+"\n```\n"
                                                })
                                            }
                                            bot.sendMessage({
                                                to: channel,
                                                message: "```\n"+JSON.stringify(resp)+"\n```"
                                            })
                                        });

                                    }, 15000);
                                }
                            }));

                        }else{
                            bot.sendMessage({
                                to: channel,
                                message: "Trivia service is currently unavailable (`"+body+"`)"
                            });
                        }
                    }catch(e){
                        bot.sendMessage({
                            to: channel,
                            message: "Error parsing trivia question: "+e
                        });
                    }
                }

            });
        }
        return true;
    }
};

function after(time, func){
    return function(err, resp){
       // var args = arguments;
        setTimeout(function(){
            func(err, resp);
        }, time);
    };
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x
    }
}