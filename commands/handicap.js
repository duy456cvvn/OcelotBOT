/**
 * Created by Peter on 09/07/2017.
 */

const gm = require('gm');
const wrap = require('word-wrap');
module.exports = {
    name: "Hanicapped Meme",
    usage: "handicap [text]",
    accessLevel: 0,
    commands: ["handicap", "handicapped"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {

        recv.simulateTyping(channel);

        if(args[1]) {
           draw(message.substring(args[0].length));
        }else{
            recv.getMessages({
                channelID: channel,
                limit: 2
            }, function(err, resp){
                draw(err || resp[1].content);
            });
        }

        function draw(text){
            gm("static/handicap.png")
                .font("static/arial.ttf", 30)
                .drawText(275, 328, wrap(text, {width: 20, indent: ''}))
                .toBuffer('PNG', function(err, buffer){
                    if(err){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: An error occurred. Try again later."
                        });
                        console.log(err);
                    }else{
                        recv.uploadFile({
                            to: channel,
                            file: buffer,
                            filename: "handicapped.png",
                            filetype: "png"
                        });
                    }
                });
        }
    }
};