var youtubedl 	= require('youtube-dl');
var spawn = require('child_process').spawn;
var http = require('http');
var https = require('https');
var fs = require('fs');
var request = require('request');
var fluent_ffmpeg = require('fluent-ffmpeg');
var PassThrough = require('stream').PassThrough;
var queue = [];
var nowPlaying = "";
var isPlaying = false;
var ffmpeg = null;
var restart = false;
var autoDirs = ['nsp', 'edm', 'jake', 'music/songs/pop', 'music/songs/edm'];
var corrosionCounter = 0;
var songList = {};
var titleCache = {};
var downloadQueue = [];


for(var i in autoDirs){
    var files = fs.readdirSync('/home/peter/'+autoDirs[i]);
    for(var j in files){
        songList[files[j].replace(".mp3", "")] = '/home/peter/'+autoDirs[i]+"/"+files[j];
    }
}

exports.command = {
    name: "m",
    desc: "Music controls",
    usage: "m\n"+
    "**--SONG CONTROLS--**\n"+
    "q <url> - **Queues an URL, or to search use `ytsearch:query`**\n"+
    "qsub <subreddit> - **Queues an entire subreddit of songs.**\n"+
    "n [file/stream] - **Skips the current song.**\n"+
    "autodj - **Starts the AutoDJ**\n"+
    "import <url/json> - **Import a list of songs from a previous exported playlist.**\n"+
    "**--INFORMATIONAL--**\n"+
    "np - **Shows the current song name.**\n"+
    "lq - **Shows the queue.**\n"+
    "export - **Export the current queue for later importing.**\n"+
    "corrosion - **Hey now hey now now.**\n"+
    "**--ADMINISTRATIONAL--**\n"+
    "forceplay - **Forces a song to play, bad idea if somethings already playing.**\n"+
    "restart - **Restarts the bot after the last song ends.**\n"+
    "refresh - **Reloads the AutoDJ list.**\n"+
    "flush - **Clears the title cache.**\n"+
    "clear - **Clears the entire queue.**\n"+
    "rm <index> - **Removes the song at the index from the queue.**\n",
    onReady: function(bot){

        if(bot.isDiscord) {
            setTimeout(function () {
                bot.queueChannel = "318433556282212352";

                bot.joinVoiceChannel(bot.queueChannel, function (err) {
                    if (err) {
                        console.log("Error joining voice channel: ");
                        console.log(err);
                    } else {
                        bot.log("Joined queue channel");

                        bot.getAudioContext(bot.queueChannel, function (err, stream) {
                            if (err) {
                                console.log(err);
                            } else {
                                (function andAgain() {
                                    var songNames = Object.keys(songList);
                                    var song = songNames[parseInt(Math.random() * songNames.length)];
                                    console.log(songList[song]);
                                    stream.playAudioFile(songList[song]);

                                    stream.once('fileEnd', function () {
                                        bot.log("Song ended (AutoDJ)");
                                        isPlaying = false;
                                        andAgain();
                                    });
                                })();
                            }
                        });
                        // playNextInQueue(bot.queueChannel, bot, "318432654880014347");
                    }

                });
            }, 10000);
        }




    },
    func: function(user, userID, channel, args, message, bot){
        if(args.length < 2)return false;
        if(args[1] === "q"){
            bot.sendMessage({
                to: channel,
                message: "Fuck you"
            });
            return true;
            // if(args.length < 3)return false;
            // var arg = args.slice(2).join(" ");
            // enqueue(arg, bot, channel);
        }else if(args[1] === "lq"){
            if(queue.length === 0){
                bot.sendMessage({
                    to: channel,
                    message: "There are no items in the queue! Add some with `!m q [url]`"
                });
            }else{
                var list = "";
                var duration = 0;
                for(var i in queue){
                    var splitDuration = queue[i].duration.split(":");
                    if(splitDuration.length > 2){
                        duration += parseInt(splitDuration[0]*3600);
                        duration += parseInt(splitDuration[1]*60);
                        duration += parseInt(splitDuration[2]);
                    }else{
                        duration += parseInt(splitDuration[0]*60);
                        duration += parseInt(splitDuration[1]);
                    }

                    if(i == 15){
                        list += "And "+(queue.length-i+1)+" more...";
                    }else if(i < 15){
                        list += (parseInt(i)+1)+". `"+queue[i].title+"` ("+queue[i].duration+")\n";
                    }
                }
                list = "Current Queue: (Duration: "+prettySeconds(duration)+")\n" + list;
                list += "\nThe following songs are being downloaded:\n";
                for(var i in downloadQueue){
                    if(i == 15){
                        list += "And "+(queue.length-i+1)+" more...";
                    }else if(i < 15){
                        list += downloadQueue[i].title+" ("+downloadQueue[i].progress+"%)\n";
                    }
                }
                bot.sendMessage({
                    to: channel,
                    message: list
                });
            }
        } else if(args[1] === "np"){
            if(nowPlaying === ""){
                bot.sendMessage({
                    to: channel,
                    message: "Nothing is currently playing! Queue some songs with `!m q [url]`"
                });
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "Now playing: `"+nowPlaying+"`"
                });
            }

        }else if(args[1] === "forceplay"){
            bot.log('User %s used forceplay. (Queue size %s)', user, queue.length);
            bot.sendMessage({
                to: channel,
                message: "*Well, alright. But don't blame me if you break something.*"
            });
            playNextInQueue(bot.queueChannel, bot, channel);
        }else if(args[1] === "autodj"){
            if(!isPlaying){
                playNextInQueue(bot.queueChannel, bot, channel);
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "Something is already playing, silly!"
                });
            }
        }else if(args[1] === "export"){
            if(queue.length > 10){
                var file = "queue-"+new Date().getMilliseconds()+".json";
                fs.writeFile("/home/www-data/files.unacceptableuse.com/"+file,JSON.stringify(queue), function(err){
                    if(err){
                        bot.sendMessage({
                            to: channel,
                            message: "Couldn't upload queue: "+err
                        });
                    }else{
                        bot.sendMessage({
                            to: channel,
                            message: "Copy and paste this somewhere safe to queue it again later!\n http://files.unacceptableuse.com/"+file
                        });
                    }
                });
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "Copy and paste this somewhere safe to queue it again later!\n ```"+JSON.stringify(queue)+"```"
                });

            }

        }else if(args[1] === "import"){
            if(args.length < 3)return false;
            try{
                if(args[2].startsWith("http")){
                    var protocol = args[2].startsWith("https") ? https : http;
                    protocol.get(args[2], function(response) {
                        var str = '';
                        response.on('data', function (chunk) {
                            str += chunk;
                        });

                        response.on('end', function () {
                            var rawQueue = str;
                            var newQueue = JSON.parse(rawQueue);
                            queue = queue.concat(newQueue);
                            bot.sendMessage({
                                to: channel,
                                message: "Added **"+newQueue.length+"** items to the queue"
                            });
                            if(!isPlaying){
                                playNextInQueue(bot.queueChannel, bot, channel);
                            }
                        });
                    });
                }else{
                    var rawQueue = args.slice(2).join(" ");
                    var newQueue = JSON.parse(rawQueue);
                    queue = queue.concat(newQueue);
                    bot.sendMessage({
                        to: channel,
                        message: "Added **"+newQueue.length+"** items to the queue"
                    });
                    if(!isPlaying){
                        playNextInQueue(bot.queueChannel, bot, channel);
                    }
                }


            }catch(e){
                bot.sendMessage({
                    to: channel,
                    message: "**Invalid queue import** "+e
                });
            }

        }else if(args[1] === "n"){
            if(!ffmpeg || (args[2] && args[2] === "file") && !(args[2] && args[2] === "stream")){
                bot.getAudioContext(bot.queueChannel, function(err, stream) {
                    stream.stopAudioFile();
                    isPlaying = false;
                });
            }else{
                isPlaying = false;
                ffmpeg.kill('SIGKILL');
                ffmpeg = null;
                playNextInQueue(bot.queueChannel, bot, channel);
            }


        }else if(args[1] === "restart"){
            if(!restart){
                bot.sendMessage({
                    to: channel,
                    message: "Restarting the bot once the " + (queue.length === 0 ? "next song" : "queue") + " ends."
                });
                restart = true;
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "A restart has already been planned."
                });
            }
        }else if(args[1] === "qsub"){
            if(args.length < 3)return false;
            var options = {
                host: 'api.reddit.com',
                path: '/r/'+args[2],
                headers: {
                    "user-agent": "OcelotBOT link parser by /u/UnacceptableUse"
                }
            };

            http.get(options, function (response) {
                var body = "";
                response.on('data', function (chunk) {
                    body += chunk;
                });

                response.on('end', function () {
                    var data = JSON.parse(body);
                    if (data.error) {
                        var message = "";
                        switch (data.error) {
                            case 404:
                                message = "Subreddit does not exist or was banned";
                                break;
                            case 403:
                                message = "Subreddit is invite only or quarantined.";
                                break;
                            default:
                                message = "Unknown error (" + data.error + ")";
                                break;

                        }

                        bot.sendMessage({
                            to: channel,
                            message: message
                        });
                    } else {
                        data = data.data;
                        if (data.children.length === 0) {
                            bot.sendMessage({
                                to: channel,
                                message: "There doesn't seem to be anything there."
                            });
                        } else {
                            var posts = data.children;
                            console.log(posts);
                            for(var i in posts){
                                var post = posts[i];
                                //console.log(post);
                                // if(post.data.url && (post.data.url.contains("youtube") || post.data.url.contains("youtu.be") || post.data.url.contains("soundcloud"))){
                                enqueue(post.data.url, bot, channel);
                                // }
                            }
                        }
                    }
                });
            });
        }else if(args[1] === "corrosion"){
            bot.sendMessage({
                to: channel,
                message: "**HEY NOW HEY NOW NOW** "+corrosionCounter+" times."
            });
        }else if(args[1] === "rescan"){
            songList = {};
            bot.sendMessage({
                to: channel,
                message: "Rescanned AutoDJ directories."
            });
            for(var i in autoDirs){
                var files = fs.readdirSync('/home/peter/'+autoDirs[i]);
                for(var j in files){
                    songList[files[j].replace(".mp3", "")] = '/home/peter/'+autoDirs[i]+"/"+files[j];
                }
            }
        }else if(args[1] === "flush"){
            titleCache = {};
            bot.sendMessage({
                to: channel,
                message: "Cleared title cache."
            });
        }else if(args[1] === "clear"){
            queue = [];
            bot.sendMessage({
                to: channel,
                message: "Cleared queue."
            });
        }else if(args[1] === "rm"){
            if(args.length < 3)return false;
            if(isNaN(args[2]))return false;
            if(args[2] < 0 || queue.length < args[2]){
                bot.sendMessage({
                    to: channel,
                    message: "Index must be > 0 and < "+queue.length+"."
                });
            }else{
                bot.sendMessage({
                    to: channel,
                    message: "Removed `"+queue[args[2]].title+"` from queue."
                });
                queue.splice(args[2], 1);
            }
        }
        return true;
    }
};


function playNextInQueue(channel, bot, requestChannel){
    if(isPlaying)return;
    bot.log("Playing next item...");
    console.log("Request channel is "+requestChannel);
    isPlaying = true;
    if (ffmpeg){
        ffmpeg.kill('SIGKILL');
        ffmpeg = null;
    }
    // bot.getAudioContext({ channel: bot.nspChannel, stereo: true}, function(stream2) {
    if(queue.length === 0) {
        if (restart) {
            process.kill(1);
        }

        console.log("Starting AutoDJ");

        bot.getAudioContext(bot.queueChannel, function (err, stream) {
            if (err) {
                console.log(err);
            } else {
                var songNames = Object.keys(songList);
                var song = songNames[parseInt(Math.random() * songNames.length)];
                console.log(songList[song]);
                stream.playAudioFile(songList[song]);
                if(song.length === 36){
                    request("https://unacceptableuse.com/petify/api/song/"+song.replace(".mp3", "")+"/details", function(err, resp, body){
                        //387c401d-bc9a-48f6-8b4f-8e660b952243
                        try{
                            var data = JSON.parse(body);
                            nowPlaying =  "[Petify] "+data.artist_name+" - "+data.title;
                        }catch(e){
                            nowPlaying = e;
                            console.log(e);
                        }finally{
                            bot.setPresence({
                                game: nowPlaying
                            });
                        }
                    });
                }else{
                    nowPlaying = "[AutoDJ] " + song;
                    bot.setPresence({
                        game: nowPlaying
                    });
                }

                stream.once('fileEnd', function () {
                    bot.log("Song ended (AutoDJ)");
                    isPlaying = false;
                    playNextInQueue(channel, bot, requestChannel)
                });
            }

        });

    }else if(queue[0].location){
        var queuedSong = queue.shift();
        console.log("Playing from location "+queuedSong.location);
        bot.getAudioContext(bot.queueChannel, function (err, stream) {
            if (err) {
                console.log(err);
            } else {
                stream.playAudioFile(queuedSong.location);
                nowPlaying = queuedSong.title;
                bot.setPresence({
                    game: nowPlaying
                });
                stream.once('fileEnd', function () {
                    bot.log("Song ended (Queued location)");
                    isPlaying = false;
                    playNextInQueue(channel, bot, requestChannel)
                });
            }

        });
    }else {

        try {
            var vidInfo = queue.shift();
            var remaining = vidInfo.duration.split(":");
            var minutesRemaining;
            var secondsRemaining;
            if(remaining.length > 2){
                minutesRemaining = parseInt(remaining[0] * 60) + parseInt(remaining[1]);
                secondsRemaining = remaining[2];
            }else{
                minutesRemaining = remaining[0];
                secondsRemaining = remaining[1];
            }
            nowPlaying = vidInfo.title;
            bot.setPresence({
                game: nowPlaying
            });
            bot.log("Playing %s", vidInfo.title);
            if(songList[vidInfo.title]){
                bot.getAudioContext( bot.queueChannel, function(err, stream) {
                    stream.playAudioFile(songList[vidInfo.title]);
                    var messageID = 0;
                    bot.sendMessage({
                        to: requestChannel,
                        message: "Playing `" + vidInfo.title + "`"
                    }, function(err, resp){
                        if(!err)
                            messageID = resp.id;
                    });
                    stream.once('fileEnd', function() {
                        isPlaying = false;
                        bot.log("Song ended (File Stream)");
                        playNextInQueue(channel, bot, requestChannel);
                        bot.editMessage({
                            channel: requestChannel,
                            messageID: messageID,
                            message: "Finished playing `" + vidInfo.title + "`"
                        });

                    });
                });
            }else{
                var messageID = 0;
                ffmpeg = spawn('ffmpeg', [
                    '-i', "pipe:0",
                    '-f', 's16le',
                    '-ar', '48000',
                    '-ac', '2',
                    'pipe:1'
                ], {stdio: ['pipe', 'pipe',  'pipe']});

                ffmpeg.stdout.once('readable', function () {

                    // var masterStream = PassThrough();
                    // var ccKufiStream = PassThrough();
                    // var ocelotStream = PassThrough();

                    // masterStream.pipe(ccKufiStream);
                    // masterStream.pipe(ocelotStream);

                    // bot.getAudioContext({ channel: channel, stereo: true}, function(stream){
                    //     stream.send(ccKufiStream);
                    // });

                    bot.getAudioContext(bot.queueChannel, function(err, stream){
                        stream.send(ffmpeg.stdout);
                    });

                    //ffmpeg.stdout.pipe(masterStream);
                    bot.sendMessage({
                        to: requestChannel,
                        message: "Playing `" + vidInfo.title + "`"
                    }, function(err, resp){
                        if(!err)
                            messageID = resp.id;
                    });
                });


                ffmpeg.stderr.on('data', function(data){
                    data = data.toString();
                    if(data.indexOf("time=") > -1 && process.hrtime()[0] % 4 === 0){
                        var index = data.search("time=")+5;
                        var time = data.substring(index, index+8).split(":");
                        var minutesPassed = parseInt(time[0] * 60) + parseInt(time[1]);
                        var secondsPassed = time[2];
                        bot.editMessage({
                            channelID: requestChannel,
                            messageID: messageID,
                            message: "Playing `"+vidInfo.title+"` "+minutesPassed+":"+secondsPassed+"/"+minutesRemaining+":"+secondsRemaining+"\n"+
                            generateBar(parseInt(secondsRemaining) + (60 * minutesRemaining), parseInt(secondsPassed) + (60 * minutesPassed))
                        });
                    }
                });

                ffmpeg.on('close', function(code){
                    console.log("FFmpeg exited with code "+code);
                    playNextInQueue(channel, bot, requestChannel);
                });

                var video = youtubedl(vidInfo.url, ["--proxy=" + bot.config.misc.proxyURL,
                    "--audio-quality=48000",
                    "--force-ipv4",
                    "--extract-audio",
                    "--audio-format=opus",
                    "--default-search=ytsearch",
                    "--no-playlist"], {cwd: __dirname});
                video.on('info', function (info) {
                    video.pipe(ffmpeg.stdin);
                });

                video.on('end', function () {
                    bot.editMessage({
                        channelID: requestChannel,
                        messageID: messageID,
                        message: "Finished playing `" + vidInfo.title + "`"
                    });
                    bot.log("%s ended", vidInfo.title);
                    nowPlaying = "";
                    isPlaying = false;
                    playNextInQueue(channel, bot, requestChannel);
                });
            }

        } catch (e) {
            if(ffmpeg){
                ffmpeg.kill('SIGKILL');
                ffmpeg = null;
            }
            bot.log("Error playing last queue item: ");
            console.log(e);
            bot.sendMessage({
                to: requestChannel,
                message: "Error playing last queue item: " + e
            });
            isPlaying = false;
            playNextInQueue(channel, bot, requestChannel);
        }
    }
}


function enqueue(url, bot, channel){
    console.log("Queueing "+url);
    var messageID = 0;
    if(titleCache[url]) {
        var video = titleCache[url];
        bot.sendMessage({
            to: channel,
            message: "Added `" + video.title + "` to queue"
        });
        queue.push(video);
    }else if(url.length === 36){
        request("https://unacceptableuse.com/petify/api/song/"+url+"/details", function(err, resp, body){
            //387c401d-bc9a-48f6-8b4f-8e660b952243
            try{
                var data = JSON.parse(body);
                var video = {title: "[Petify] "+data.artist_name+" - "+data.title, location: data.path, duration: "0:"+data.duration};
                bot.sendMessage({
                    to: channel,
                    message: "Added `" + video.title + "` from Petify to the queue"
                });
                queue.push(video)
            }catch(e){
                bot.sendMessage("Error queueing song: "+e);
                console.log(e);
            }
        });

    }else{
        bot.sendMessage({
            to: channel,
            message: "Added `retrieving title...` to queue"
        }, function(err, resp){
            if(!err)
                messageID = resp.id;
        });
        youtubedl.getInfo(url, [
                "--proxy=" + bot.config.misc.proxyURL,
                "--yes-playlist",
                "--default-search=\"ytsearch\"",
                "--force-ipv4"],
            function(err, info){
                bot.log("Received video info");
                if(err){
                    console.log("Error: "+err);
                    sendOrEdit("**Error downloading video: `"+err+"`**", messageID, channel, bot);
                }else{
                    if(info.length){
                        sendOrEdit("Added "+info.length+" videos from `"+info[0].playlist+"`", messageID, channel, bot);
                        for(var i in info){
                            queue.push({url: info[i].webpage_url, title: info[i].title, duration: info[i].duration});
                        }
                    }else{
                        sendOrEdit("Added `"+info.fulltitle+"` to queue", messageID, channel, bot);
                        var video = {url: info.webpage_url, title: info.title, duration: info.duration};
                        titleCache[url] = video;
                        if(isPlaying && queue.length >= 1){
                            downloadAndQueue(video, channel,  bot);
                        }else{
                            queue.push(video);
                        }

                    }
                }
            });
    }
    if(!isPlaying){
        playNextInQueue(bot.queueChannel, bot, channel);
    }
}


function sendOrEdit(text, messageID, channel, bot){
    if(messageID !== 0){
        bot.editMessage({
            channelID: channel,
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

function mirrorStream(channel, func){
    bot.getAudioContext({ channel: channel, stereo: true}, func);
    //setTimeout(function(){
    //    bot.getAudioContext({ channel: bot.nspChannel, stereo: true}, func);
    //}, 500);
}

function quantify(data, unit, value) {
    if (value) {
        if (value > 1 || value < -1)
            unit += 's';

        data.push(value + ' ' + unit);
    }

    return data;
}

function prettySeconds(seconds) {

    var prettyString = '',
        data = [];

    if (typeof seconds === 'number') {

        data = quantify(data, 'day',    parseInt(seconds / 86400));
        data = quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
        data = quantify(data, 'minute', parseInt((seconds % 3600) / 60));
        data = quantify(data, 'second', Math.floor(seconds % 60));

        var length = data.length,
            i;

        for (i = 0; i < length; i++) {

            if (prettyString.length > 0)
                if (i == length - 1)
                    prettyString += ' and ';
                else
                    prettyString += ', ';

            prettyString += data[i];
        }
    }

    return prettyString;
}


function downloadAndQueue(video, channel, bot){
    video.progress = 0;
    var id = downloadQueue.push(video)-1;
    var downloader = youtubedl(video.url,["--proxy=" + bot.config.misc.proxyURL,
        "--audio-quality=48000",
        "--force-ipv4",
        "--extract-audio",
        "--audio-format=opus",
        "--default-search=ytsearch",
        "--no-playlist"], {cwd: __dirname});


    downloader.on("error", function songDownloadError(downloadError){
        bot.sendMessage({
            to: channel,
            message: "Error downloading "+video.title+": `"+downloadError+"`"
        });
       console.log(downloadError);
       downloadQueue.splice(id);
    });

    var progressSeconds = 0, lastSeconds = 0;

    downloader.on("progress", function onProgress(progress){
        var timeSplit = progress.timemark.split(":"); //hh:mm:ss.ms
        var newSeconds = (timeSplit[0] * 3600) + (timeSplit[1] * 60) + parseInt(timeSplit[2]);
        progressSeconds += newSeconds-lastSeconds;
       video.progress =  Math.floor(progressSeconds/video.duration)*100;
    });

    downloader.on("info", function songInfoStart(){
        fluent_ffmpeg()
            .input(downloader)
            .audioCodec("libmp3lame")
            .audioFilters("silenceremove=0:0:0:-1:1:-50dB")
            .save("/home/peter/stevie3/queue/"+video.title+".mp3")
            .on('error', function songDownloadError(err) {
                bot.sendMessage({
                    to: channel,
                    message: "Error converting "+video.title+": `"+err+"`"
                });
                downloadQueue.splice(id);
            })
            .on('end', function songDownloadEnd() {
                downloadQueue.splice(id);
                video.url = null;
                video.location = "/home/peter/stevie3/queue/"+video.title+".mp3";
                queue.push(video)
            });
    })
}