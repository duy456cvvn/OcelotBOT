/**
 * Created by Peter on 18/06/2017.
 */
//what

var request = require('request');

exports.command = {
    name: "snapchat",
    desc: "Generate a snapcode",
    usage: "snapchat [username]",
    func: function(user, userID, channel, args, message, bot){
        if(!args[1])return false;

        bot.simulateTyping(channel);
        request("https://snapcodes.herokuapp.com/snapcode.php?username="+args[1]+"&size=400", function(err, resp, body){
            console.log("we got some shit homie");
            console.log(body);
           if(!err){
               svg2png(new Buffer(body), {width: 400, height: 400})
                   .then(function(image){
                       bot.uploadFile({
                           to: channel,
                           file: image,
                           filename: "snapcode.png",
                           filetype: "png",
                           message: "Here's your snapcode:"
                       });
                   })
                   .catch(function(err){
                       bot.sendMessage({
                           to: channel,
                           message: "Error: "+err
                       });
                   });
           }else{
               bot.sendMessage({
                   to: channel,
                   message: err
               });
           }
        });



        return true;
    }
};






var path = require("path");
var fileURL = require("file-url");
var childProcess = require("pn/child_process");

var phantomjsCmd = require("phantomjs-prebuilt").path;
var converterFileName = path.resolve(__dirname, "../node_modules/svg2png/lib/converter.js");

var PREFIX = "data:image/png;base64,";

var svg2png = (sourceBuffer, options) => {
    return Promise.resolve().then(() => { // catch thrown errors
        var cp = childProcess.execFile(phantomjsCmd, getPhantomJSArgs(options), { maxBuffer: Infinity });

        writeBufferInChunks(cp.stdin, sourceBuffer);

        return cp.promise.then(processResult);
    });
};

module.exports.sync = (sourceBuffer, options) => {
    var result = childProcess.spawnSync(phantomjsCmd, getPhantomJSArgs(options), {
        input: sourceBuffer.toString("utf8")
    });
    return processResult(result);
};

function getPhantomJSArgs(options) {
    if (options.filename !== undefined && options.url !== undefined) {
        throw new Error("Cannot specify both filename and url options");
    }

    // Convert filename option to url option
    if (options.filename !== undefined) {
        options = Object.assign({ url: fileURL(options.filename) }, options);
        delete options.filename;
    }

    return [
        converterFileName,
        JSON.stringify(options)
    ];
}

function writeBufferInChunks(writableStream, buffer) {
    var asString = buffer.toString("utf8");

    var INCREMENT = 1024;

    writableStream.cork();
    for (var offset = 0; offset < asString.length; offset += INCREMENT) {
        writableStream.write(asString.substring(offset, offset + INCREMENT));
    }
    writableStream.end();
}

function processResult(result) {
    var stdout = result.stdout.toString();
    if (stdout.startsWith(PREFIX)) {
        return new Buffer(stdout.substring(PREFIX.length), "base64");
    }

    if (stdout.length > 0) {
        // PhantomJS always outputs to stdout.
        throw new Error(stdout.replace(/\r/g, "").trim());
    }

    var stderr = result.stderr.toString();
    if (stderr.length > 0) {
        // But hey something else might get to stderr.
        throw new Error(stderr.replace(/\r/g, "").trim());
    }

    throw new Error("No data received from the PhantomJS child process");
}
