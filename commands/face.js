/**
 * Created by Peter on 18/07/2017.
 */

const request = require('request');
const config = require('config');
module.exports = {
    name: "Face Recognition",
    usage: "face [url] or embed",
    accessLevel: 0,
    commands: ["face", "age"],
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
            }, function(err, resp){
                for(var i = resp.length-1; i > 0; i--){
                    var message = resp[i];
                    if(message.attachments[0] && message.attachments[0].url){
                        identify(message.attachments[0].url);
                        return;
                    }
                }
                recv.sendMessage({
                    to: channel,
                    message: ":bangbang: I don't know what image you're referring to. Need to supply a URL or attachment..."
                });
            });
        }

        function identify(url){
            request({
                method: 'POST',
                json: true,
                url: "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender",
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": config.get("Commands.face.key")
                },
                body: {
                    url: url
                }
            }, function(err, resp, body){
                if(body.length > 0) {
                    if(body.length === 1){
                        recv.sendMessage({
                            to: channel,
                            message: `:thinking: Looks like a **${body[0].faceAttributes.age} year old ${body[0].faceAttributes.gender}**.`
                        });
                    }else{
                        var output = "";
                        for(var i = 0; i < body.length; i++){
                            output += `a **${body[i].faceAttributes.age} year old ${body[i].faceAttributes.gender}**`;
                            output += i < body.length-2 ? ", " : i === body.length-2 ? " and " : "."
                        }
                        recv.sendMessage({
                            to: channel,
                            message: `:thinking: I see ${body.length} faces. ${output}`
                        });
                    }

                }else{
                    recv.sendMessage({
                        to: channel,
                        message: ":( I couldn't find any faces in that image."
                    });
                }
            })
        }

    }
};