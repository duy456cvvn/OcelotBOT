var Throttle = require('throttle'),
    fs = require('fs'),
    probe = require('node-ffprobe'),
    lame = require("lame"),
    passStream = require('pass-stream');
var clients = [];
var decoder = lame.Decoder();
var encoder = lame.Encoder({channels: 2, bitDepth: 16, sampleRate: 44100});
var ps = passStream();
var stream;
exports.command = {
    name: "m2",
    desc: "Music bot",
    usage: "m q",
    onReady: function onReady(bot){

        //var track = "/home/peter/nsp/Non-stop Pop Interlude 1.mp3";
        //
        //
        //encoder.on("data", function(data) {
        //    clients.forEach(function(client){
        //        client.write(data);
        //    });
        //});
        //
        //decoder.on('format', function(format) {
        //    decoder.pipe(encoder);
        //});
        //
        //var that = this;
        //this.streamTrack(track, function trackFinish(){
        //    bot.log("Song finished");
        //    that.streamTrack(track);
        //});
        //
        //bot.app.get("/radio/stream.ogg", function getRadioStream(req, res){
        //    bot.log("Socket opened");
        //    clients.push(res);
        //    req.socket.on('close', function socketClose(){
        //       bot.log("Socket closed");
        //        delete clients[clients.indexOf(res)];
        //    });
        //});
    },

    streamTrack: function streamTrack(path, onEnd){
        probe(path, function(err, probeData) {
            var bit_rate = probeData.format.bit_rate;
            var stream = fs.createReadStream(path);
            stream.on('end', function streamEnd(){
               console.log("Stream ended");
                if(onEnd)
                    onEnd();
            });
            var throttle = new Throttle((bit_rate/10) * 1.4);
            stream.pipe(ps);
            ps.pipe(throttle);
            throttle.pipe(decoder);
        });
    },

    func: function (user, userID, channel, args, message, bot) {
        bot.sendMessage({
            to: channel,
            message: " mmmmmusic pong"
        });

		//Allow a minimum of one argument
        if(args.length < 2)return false;




        return true;
    }
};
