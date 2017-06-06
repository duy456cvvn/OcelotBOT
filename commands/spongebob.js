/**
 * Created by Peter on 06/06/2017.
 */
exports.command = {
    name: "spongebob",
    desc: "MAkEs a SpoNGeBoB MeME",
    usage: "spongebob [text]",
    func: function(user, userID, channel, args, message, bot){


        var doSponge = function doSponge(input){
            var output = "";
            for(var i in input){
                if(input.hasOwnProperty(i))
                    if(Math.random() > 0.5)output+= input[i].toLowerCase();
                    else output+= input[i].toUpperCase();
            }
            if(bot.isDiscord){
                bot.sendMessage({
                    to: channel,
                    message: output,
                    embed: {
                        image: {
                            url: "http://i3.kym-cdn.com/entries/icons/original/000/022/940/spongebobicon.jpg"
                        }
                    }
                });
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "NYI"
                });
            }
        };

        if(!args[1]){
            bot.getMessages({
                channelID: channel,
                limit: 2
            }, function(err, resp){
                   doSponge(err || resp[1].content);
            });
        }else{
            doSponge(args[1]);
        }






        return true;
    }
};