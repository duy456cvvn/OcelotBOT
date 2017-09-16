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