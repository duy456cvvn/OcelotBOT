/**
 * Created by Peter on 13/07/2017.
 */

const clarifai = require('clarifai');
const config = require('config');

var identifier = new clarifai.App({
    apiKey: config.get("Commands.identify.key")
});


const messages = [
    "That looks like ",
    "That appears to be ",
    "Seems like ",
    "Might be ",
    "Could be ",
    "Probably ",
    "Possibly ",
    "I see ",
    "Looks like "
];


const vowels = "aeiou";
module.exports = {
    name: "Identify Image",
    usage: "identify [URL]",
    accessLevel: 0,
    commands: ["identify", "ident"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {

        recv.simulateTyping(channel);

        if(event.d.attachments[0]){
            identify(event.d.attachments[0].url);
        }else if(args[1] && args[1].startsWith("http")){
            identify(args[1]);
        }else{
            recv.getMessages({
                channelID: channel,
                limit: 100
            }, async function(err, resp){
                for(var i = resp.length-1; i > 0; i--){
                    var message = resp[i];
                    if(message.attachments[0] && message.attachments[0].url){
                        identify(message.attachments[0].url);
                        return;
                    }
                }
                recv.sendMessage({
                    to: channel,
                    message: await bot.lang.getTranslation(server, "FACE_NO_IMAGE")
                });
            });
        }

        function identify(url){
            identifier.models.predict(Clarifai.GENERAL_MODEL, url).then(
                function(response) {
                    var item = response.outputs[0].data.concepts[0].name;

                    recv.sendMessage({
                        to: channel,
                        message: `:eyes: ${bot.util.arrayRand(messages)}${vowels.indexOf(item[0]) > -1 ? "an" : "a"} **${item}**.`
                    });
                },
                async function(err) {
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "GENERIC_ERROR")
                    });
                    bot.error(err);
                }
            );
        }

    }
};