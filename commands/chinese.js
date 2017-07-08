/**
 * Created by Peter on 08/07/2017.
 */


//计	订	讣	认	讥	讦	讧	讨	让	讪

const subs = {
    "a": ["卂", "冃", "円", "闩"],
    "b": ["阝"],
    "c": ["匚", "亡", "匸", "汇"],
   // "d": [""],
    "e": ["巳", "乇", "㔾", "彐"],
   //"f": [""],
   //"g": [""],
    "h": ["卄", "九", "廾"],
    "i": ["彳", "丨", "讠", "辶"],
    "j": ["丿"],
    "k": ["长"],
    "l": ["丨"],
    "m": ["冂冂"],
    "n": ["冂", "兀", "刀"],
    "o": ["口", "曰"],
    "p": ["尸", "户"],
    //"q": [""],
    "r": ["尺", "卜", "厂", "广"],
    //"s": [""],
    "t": ["丁", "ㄒ", "㓀", "十", "卞", "才"],
    "u": ["凵", "凹"],
   //"v": [""],
   //"w": [""],
    "x": ["乂"],
    "y": ["丫"],
    "z": ["乙"]
};

module.exports = {
    name: "Chinese Text",
    usage: "chinese <text>",
    accessLevel: 0,
    commands: ["chinese", "chin"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        const sentence = message.substring(message.indexOf(args[1]));
        const letters = sentence.split("");
        var output = "";
        for(var i in letters){
            if(subs[letters[i]]){
                output += bot.util.arrayRand(subs[letters[i]]);
            }else{
                output += letters[i];
            }
        }
        recv.sendMessage({
            to: channel,
            message: output
        });
    }
};