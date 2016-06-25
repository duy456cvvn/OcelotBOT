var youtubedl 	= require('youtube-dl'),
	fs 			= require('fs'),
	ffmpeg		= require('fluent-ffmpeg'),
	path		= require('path').resolve;

var ytdlArgs;

exports.command = {
	name: "youtube",
	desc: "Download youtube videos",
	usage: "youtube <video> [radio-dir]",
    onReady: function(bot){
      ytdlArgs = [
          "--proxy=" + bot.config.misc.proxyURL,
          "--yes-playlist",
          "--default-search=\"ytsearch\"",
          "--force-ipv4"
      ];
    },
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;
        var url = args[1];
        var messageID = "";
        bot.sendMessage({
        	to: channel,
        	message: "Test"
        }, function(err, resp){
            if(!err)
                messageID = resp.id;
        });

        youtubedl.getInfo(url, ytdlArgs, function(err, info){
                debug("Received video info");
                if(err){
                    sendOrEdit("**Error downloading video: `"+err+"`**", messageID, channel, bot);
                }else{
                    if(info.length){
                        sendOrEdit("Added "+info.length+" videos from `"+info[0].playlist+"`", messageID, channel, bot);
                        for(var i in info){
                            queue.push({url: info[i].webpage_url, title: info[i].title, duration: info[i].duration});
                        }
                    }else{
                        sendOrEdit("Added `"+info.fulltitle+"` to queue", messageID, channel);
                        var video = {url: info.webpage_url, title: info.title, duration: info.duration};
                        titleCache[url] = video;
                        queue.push(video);
                    }
                }
            });

		return true;
	}
};

function sendOrEdit(text, messageID, channel, bot){
    if(messageID !== 0){
        bot.editMessage({
            channel: channel,
            messageID: messageID,
            message: text
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