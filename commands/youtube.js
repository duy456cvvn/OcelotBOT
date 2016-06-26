var youtubedl 	= require('youtube-dl'),
	fs 			= require('fs'),
	ffmpeg		= require('fluent-ffmpeg'),
	path		= require('path').resolve;



exports.command = {
	name: "youtube",
	desc: "Download youtube videos",
	usage: "youtube <video> [radio-dir]",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;
        var url = args[1].substring(1, args[1].length-1);
        var messageID = "";
        bot.sendMessage({
        	to: channel,
        	message: "Retrieving video information..."
        }, function messageResponse(err, resp){
            if(!err) {
                messageID = resp.ts;
            }
            else
                bot.sendMessage({
                	to: channel,
                	message: err
                });
        });


        youtubedl.getInfo(url, [
            "--proxy=" + bot.config.misc.proxyURL,
            "--yes-playlist",
            "--default-search=\"ytsearch\"",
            "--force-ipv4"
        ], function ytGetInfo(err, info){


            if(err){
                sendOrEdit("**Error downloading video: `"+err+"`**", messageID, channel, bot);
            }else{
                if(info.length){
                    sendOrEdit("Downloading "+info.length+" videos from `"+info[0].playlist+"`", messageID, channel, bot);
                    var videos = [];
                    for(var i in info){
                        videos.push({url: info[i].webpage_url, title: info[i].title, duration: info[i].duration});
                    }
                    downloadPlaylist(videos, bot);
                }else{
                    var video = {url: info.webpage_url, title: info.title, duration: info.duration};
                    sendOrEdit("Downloading `"+info.fulltitle+"`...", messageID, channel, bot);
                    download(video, bot);
                    //queue.push(video);
                }
            }
        });
            return true;

    }
};


function download(video, bot){

}

function downloadPlaylist(videos, bot){

}

function sendOrEdit(text, messageID, channel, bot){
    if(messageID !== 0){
        bot.editMessage({
            channel: channel,
            messageID: messageID,
            message: text
        }, function(err, resp){
            if(err  || !resp.ok){
                bot.sendMessage({
                    to: channel,
                    message: text
                });
            }
        });
    }else{
        bot.sendMessage({
            to: channel,
            message: text
        });
    }
}

function generateBar(total, remaining){
    var str = "[";
    var percentage = remaining/total;
    for(var i = 0; i < 50; i++){
        if(i > (percentage * 50)){
            str += "\u2591";
        }else{
            str += "\u2588";
        }
    }
    str += "]";
    return str;
}