/**
 * Created by Peter on 07/07/2016.
 */
var commonWords = [
    "was", "is", "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","person","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us", "it's", "don't", "dont"
];

function prettyMemory(bytes){
    if(bytes < 1000)return bytes+" bytes"; //< 1kb
    if(bytes < 1000000)return parseInt(bytes/1000)+"KB"; //<1mb
    if(bytes < 1e+9)return parseInt(bytes/1000000)+"MB"; //<1gb
    if(bytes < 1e+12)return parseInt(bytes/1e+9)+"GB"; //<1tb
    if(bytes < 1e+15)return parseInt(bytes/1e+12)+"TB"; //<1pb
    return parseInt(bytes/1e+15)+"PB";
}

function quantify(data, unit, value) {
    if (value) {
        if (value > 1 || value < -1)
            unit += 's';

        data.push(value + ' ' + unit);
    }

    return data;
}


function prettyDuration(seconds) {
    var prettyString = '',
        data = [];

    if (typeof seconds === 'number') {

        data = quantify(data, 'year', parseInt(seconds / 31556926));
        data = quantify(data, 'day', parseInt(seconds / 86400));
        data = quantify(data, 'hour', parseInt((seconds % 86400) / 3600));
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

exports.command = {
    name: "stats",
    desc: "Stats n shit",
    usage: "stats <user>",
    func: function(user, userID, channel, args, message, bot) {
        if(bot.isDiscord)return true;
        var target = args[1] ? args[1].toLowerCase() : "everyone";

        bot.sendMessage({
            to: channel,
            message: "Gathering stats (This might take a while)..."
        }, function(err, resp) {
            if(!err) {
                var messageID = resp.ts,
                    output = [`*Overview for ${target}*:`],
                    totalMessages = 0,
                    totalWords = 0,
                    totalChars = 0,
                    emojis = {},
                    totalEmojis = 0,
                    uniqueWords = {},
                    channels = {};

                bot.connection.query(target == "everyone" ? 'SELECT * FROM Messages' : 'SELECT * FROM Messages WHERE user = ?', [target], function(err, result) {
                    if(err) {
                        output.push(`Error getting messages: ${err}`);
                    } else {
                        totalMessages = result.length;

                        result.forEach(function(row) {
                            var message = row.message,
                                chan = row.channel,
                                words = message.split(' ');

                            totalWords += words.length;
                            totalChars += message.length;
                            words.forEach(function(w) {
                                if (w.length > 3 && commonWords.indexOf(w) == -1) {
                                    if(!(w in uniqueWords)) {
                                        uniqueWords[w] = 0;
                                    }
                                    uniqueWords[w]++;
                                }
                            });

                            if(!(chan in channels)) {
                                channels[chan] = 0;
                            }
                            channels[chan]++;

                            var emojiRegex = message.match(/:[^:\s]+:/g);
                            if(emojiRegex && emojiRegex.length > 0) {
                                emojiRegex.forEach(function(e) {
                                    if(!(e in emojis)) {
                                        emojis[e] = 0;
                                    }
                                    emojis[e]++;
                                });
                                totalEmojis += emojiRegex.length;
                            }
                        });

                        var uniqueWordsSorted = Object.keys(uniqueWords).sort(function(a, b) {
                            return uniqueWords[a] - uniqueWords[b]
                        });
                        var channelsSorted = Object.keys(channels).sort(function(a, b) {
                            return channels[a] - channels[b]
                        });

                        var emojisSorted = Object.keys(emojis).sort(function(a, b) {
                            return emojis[a] - emojis[b]
                        });

                        output = output.concat([
                            `- *${totalMessages}* total messages.`,
                            `- *${totalWords}* total words (*${Object.keys(uniqueWords).length}* unique).`,
                            `- *${parseInt(totalWords / totalMessages)}* words per message.`,
                            `- *${totalChars}* total characters.`,
                            `- At *44* words per minute, this would've taken *${prettyDuration(totalChars / 200)}* to type.`,
                            `- All their messages in a text file would take *${prettyMemory(totalChars)}*`,
                            `- The most used word is *'${uniqueWordsSorted[uniqueWordsSorted.length - 1]}'* with *${uniqueWords[uniqueWordsSorted[uniqueWordsSorted.length - 1]]}* uses.`,
                            `- Their favourite emoji is *${emojisSorted[emojisSorted.length-1]}*, having used it *${emojis[emojisSorted[emojisSorted.length-1]]}* times. They have used *${emojisSorted.length}* different emojis, *${totalEmojis}* total times.`,
                            `- Their favourite channel is *${channelsSorted[channelsSorted.length - 1]}* with *${channels[channelsSorted[channelsSorted.length - 1]]}* messages.`
                        ]);

                        bot.editMessage({
                            channel: channel,
                            messageID: messageID,
                            message: output.join('\n')
                        });
                    }
                });
            }
        });
        return true;
    }
};


