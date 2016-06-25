/**
 * Created by Peter on 24/06/2016.
 */
exports.command = {
    name: "unicode",
    desc: "Convert text to magic unicode stuff",
    usage: "unicode bold/italic/regional/fullwidth",
    dictionary: {
        circle: {
            a: "\u24D0",
            b: "\u24D1",
            c: "\u24D2",
            d: "\u24D3",
            e: "\u24D4",
            f: "\u24D5",
            g: "\u24D6",
            h: "\u24D7",
            i: "\u24D8",
            j: "\u24D9",
            k: "\u24DA",
            l: "\u24DB",
            m: "\u24DC",
            n: "\u24DD",
            o: "\u24DE",
            p: "\u24DF",
            q: "\u24E0",
            r: "\u24E1",
            s: "\u24E2",
            t: "\u24E3",
            u: "\u24E4",
            v: "\u24E5",
            w: "\u24E6",
            x: "\u24E7",
            y: "\u24E8",
            z: "\u24E9"
        },
        test: {
            a: "A",
            b: "B"
        }
    },
    func: function(user, userID, channel, args, message, bot){

        if(args.length < 3)return false;
        var messageToConvert = message.substring(message.indexOf(args[2])+args[2].length-1);
        var output = [];
        if(this.dictionary[args[1]]){
            for(var i in messageToConvert){
                if(messageToConvert.hasOwnProperty(i)){
                    if(this.dictionary[args[1]][messageToConvert[i]])
                        output.push(this.dictionary[args[1]][messageToConvert[i]]);
                    else
                        output.push(messageToConvert[i]);
                }

            }
            bot.sendMessage({
            	to: channel,
            	message: JSON.stringify(output)
            });
        }else{
            return false;
        }
        return true;
    }
};

