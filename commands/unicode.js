/**
 * Created by Peter on 24/06/2016.
 */
exports.command = {
    name: "unicode",
    desc: "Convert text to magic unicode stuff",
    usage: "unicode bold/italic/regional/fullwidth",
    dictionary: {
        circle: {
            lowerBase: 0x24d0,
            lowerTop: 0x24e9,
            upperBase: 0x24b6,
            upperTop: 0x24cf,
            specialChars: {
                "0": 0x24ea,
                "1": 0x2460,
                "2": 0x2461,
                "3": 0x2462,
                "4": 0x2463,
                "5": 0x2464,
                "6": 0x2465,
                "7": 0x2466,
                "8": 0x2467,
                "9": 0x2468
            },
            supportsUpper: true
        }
    },
    func: function(user, userID, channel, args, message, bot){

        if(args.length < 3)
            return false;

        var type = args[1],
            messageToConvert = message.substring(message.indexOf(args[2])),
            output = [],
            info = this.dictionary[type];

        if(info) {
            var supportsUpper = info["supportsUpper"],
                lowerBase = info["lowerBase"],
                upperBase = supportsUpper ? info["upperBase"] : 65;

            for(var idx in messageToConvert) {
                if(messageToConvert.hasOwnProperty(idx)) {
                    var letter = messageToConvert[idx],
                        isUpper = letter == letter.toUpperCase(),
                        letterBase = (letter != " ") ? (isUpper ? upperBase : lowerBase) : 65;

                    output.push(String.fromCharCode(`0x${(letterBase + letter.charCodeAt(0) - (isUpper ? 65 : 97)).toString(16)}`));
                }

            }
            bot.sendMessage({
            	to: channel,
            	message: output.join("")
            });
        } else {
            return false;
        }
        return true;
    }
};

