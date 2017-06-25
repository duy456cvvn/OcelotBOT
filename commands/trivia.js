/**
 * Created by Peter on 02/06/2017.
 */
var request = require('request');
var async = require('async');
const columnify = require('columnify');
var questionInProgress = false;
var correctAnswer = false;
var triviaSeconds = 15;

const difficulties = [
    "easy",
    "medium",
    "hard"
];

exports.command = {
    name: "trivia",
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
                        data.push({
                            "#": i++,
                            "User": bot.users[entry.user] ? bot.users[entry.user].username+"#"+bot.users[entry.user].discriminator : "Unknown User "+entry.user,
                            "Score": entry.Score,
                            "Correct": entry.correct,
                            "Incorrect": entry.incorrect,
                            "Win Rate": parseInt((entry.correct/(entry.correct+entry.incorrect))*100)+"%"
                        });
                        cb();
                    }, function(){
                        bot.sendMessage({
                            to: channel,
                            message: "TOP 10 Trivia Players:\n```yaml\n"+columnify(data)+"\n```"
                        });
                    })

                }

            });

        }else if(questionInProgress){
            bot.sendMessage({
                to: channel,
                message: "You can't start another question when one is already in progress. Vote with reactions!"
            });
        }else{
            request("https://opentdb.com/api.php?amount=1&type=boolean&encode=url3986", function(err, resp, body){
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: "Trivia service is currently unavailable ("+err+")"
                    })
                }else{
                    try{
                        var data = JSON.parse(body);
                        if(data.results[0]){
                            var question = data.results[0];
                            correctAnswer = question.correct_answer === "True";
                            var winners = "";
                            var results = {};
                            var winnerArray;
                            var wrong;
                            async.mapValuesSeries({
                                attachmentResp: function(cb){
                                   bot.sendAttachment(channel, `Category: *${decodeURIComponent(question.category)}*`, [{
                                       fallback: `True/False: ${encodeURIComponent(question.question)}. React :white_check_mark: for true and :negative_squared_cross_mark: for false. You have ${triviaSeconds} seconds.`,
                                       color: "#00ad00",
                                       title: `*You have ${triviaSeconds} seconds to answer.*\nTrue or False:`,
                                       text: decodeURIComponent(question.question),
                                       fields: [
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
                                       ]
                                   }], cb);
                                },
                                addTrueReact: function(cb){
                                    bot.addReaction({
                                        channelID: channel,
                                        messageID: results.attachmentResp.id || results.attachmentResp.ts,
                                        reaction: "✅",
                                        reactionName: "white_check_mark"
                                    }, cb);
                                },
                                addFalseReact: function(cb){
                                    bot.addReaction({
                                        channelID: channel,
                                        messageID: results.attachmentResp.id || results.attachmentResp.ts,
                                        reaction: "❎",
                                        reactionName: "negative_squared_cross_mark"
                                    }, cb);
                                },
                                triviaEnd: function(cb){
                                    setTimeout(cb, triviaSeconds*1000);
                                },
                                getTrueReacts: function(cb){
                                    bot.getReaction({
                                        channelID: channel,
                                        messageID: results.attachmentResp.id,
                                        reaction:  "✅"
                                    }, cb);
                                },
                                getFalseReacts: function(cb){
                                    bot.getReaction({
                                        channelID: channel,
                                        messageID: results.attachmentResp.id,
                                        reaction: "❎"
                                    }, cb);
                                },
                                calculateWinners: function(cb){
                                    var trueVoters = [], falseVoters = [];
                                    for(var i in results.getTrueReacts){
                                        trueVoters.push("<@"+results.getTrueReacts[i].id+">");
                                    }
                                    for(var j in results.getFalseReacts){
                                        falseVoters.push("<@"+results.getFalseReacts[j].id+">");
                                    }

                                    var correct = (correctAnswer ? trueVoters : falseVoters);
                                    wrong = (!correctAnswer ? trueVoters : falseVoters);

                                    winnerArray = [];

                                    for(var k in correct){
                                        var user = correct[k];
                                        if(wrong.indexOf(user) === -1){
                                            winnerArray.push(user);
                                        }
                                    }

                                    winners = winnerArray.length > 0 ? "Congratulations "+winnerArray.join(" ") : "Nobody won that round.";
                                    setTimeout(cb, 100);
                                },
                                showWinners: function(cb){
                                    bot.sendMessage({
                                        to: channel,
                                        message: `Time's up! The correct answer was **${correctAnswer}**.\n${winners}`
                                    }, cb);
                                },
                                addScores: function(cb){
                                    async.eachSeries(winnerArray, function(winner, cb2){
                                        var id = winner.replace(/[<>@]/g, "");
                                        bot.connection.query(`INSERT INTO trivia (user, correct, difficulty, server) VALUES (${id}, 1, ${difficulties.indexOf(question.difficulty)+1}, '${bot.channels[channel].guild_id}')`, cb);
                                    }, cb);
                                },
                                addLosers: function(cb){
                                    async.eachSeries(wrong, function(winner, cb2){
                                        var id = winner.replace(/[<>@]/g, "");
                                        if(id !== "146293573422284800")
                                        bot.connection.query(`INSERT INTO trivia (user, correct, difficulty, server) VALUES (${id}, 0, ${difficulties.indexOf(question.difficulty)+1}, '${bot.channels[channel].guild_id}')`, cb);
                                        else cb();
                                    }, cb);
                                }
                            },
                            function(func, key, callback){
                                setTimeout(function(){
                                    func(function(err, result){
                                        if(result){
                                            results[key] = result;
                                        }
                                        callback(err, result);
                                    });
                                }, 150);
                            }
                            ,function(err){
                                if(err){
                                    bot.log(err);
                                }
                                questionInProgress = false;
                            });

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