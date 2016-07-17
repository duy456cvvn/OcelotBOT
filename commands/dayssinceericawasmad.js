/**
 * Created by Peter on 07/05/2016.
 */
var fs = require('fs');
var vids = [
'[{"url":"https://www.youtube.com/watch?v=b6UAYGxiRwU","title":"Carly Simon - You\'re So Vain (with lyrics)","duration":"4:17"}]',
'[{"url":"https://www.youtube.com/watch?v=KRzMtlZjXpU","title":"The Black Eyed Peas - Shut Up","duration":"4:26"}]',
'[{"url":"https://www.youtube.com/watch?v=xAkg4cwJp1Y","title":"Kaiser Chiefs - Everyday I Love You Less and Less","duration":"3:45"}]',
'[{"url":"https://www.youtube.com/watch?v=ZTVfXK9NA-w","title":"Bitch Came Back - Theory of a Deadman ( lyrics )","duration":"3:39"}]',
'[{"url":"https://www.youtube.com/watch?v=rhfiiGGy7Ls","title":"meredith brooks bitch","duration":"3:58"}]',
'[{"url":"https://www.youtube.com/watch?v=pc0mxOXbWIU","title":"CeeLo Green - FUCK YOU (Official Video)","duration":"3:54"}]',
'[{"url":"https://www.youtube.com/watch?v=BR4yQFZK9YM","title":"P!nk - Stupid Girls","duration":"3:32"}]',
'[{"url":"https://www.youtube.com/watch?v=sGKCC9G9H-c","title":"Porcelain Black - Pretty Little Psycho (Audio)","duration":"3:21"}]'
];

/**
 * @deprecated
 * @type {{name: string, desc: string, usage: string, func: Function}}
 */
exports.command = {
    name: "dsem",
    desc: "Days since Erica was mad",
    usage: "*DEPRECATED* dsem [reset] [reason]",
    func: function(user, userID, channel, args, message, bot){
        var erica = {mad: 0, record: 0, reason: "", total: 0, count: 0};
        var now = new Date().getTime();

         fs.readFile('erica.json', function(err, data){
            if(err){
                bot.sendMessage({
                        to: channel,
                        message: "Couldn't open file. "+err
                    });
            }else{
                erica = JSON.parse(data);

                var timeDiff = Math.abs(now - erica.mad);
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))-1;

                if(args[1] && args[1] === "reset"){
                    erica.mad = now;
                    erica.reason = args[2] || "<No reason specified, probably something dumb>";
                    //FIXME: Re-implement radio
                    // bot.sendMessage({
                    //        to: channel,
                    //        message: "!m import "+vids[parseInt(Math.random() * vids.length)]
                    //});
                	erica.total += diffDays;
                 	erica.count++;
                    if(diffDays > erica.record){
                        erica.record = diffDays;
                        bot.sendMessage({
                            to: channel,
                            message: "Reset. Damn, bro... Just broke a record streak of `"+diffDays+"` days."
                        });
                    }else{
                         bot.sendMessage({
                            to: channel,
                            message: "Reset. Damn, bro... It only lasted `"+diffDays+"` days."
                        });
                    }
               
                    fs.writeFile("erica.json", JSON.stringify(erica), function(err) {
                        if(err) {
                            bot.sendMessage({
                                to: channel,
                                message: "Couldn't reset: "+err
                            });
                        }
                    });
                }else{
                     bot.sendMessage({
                        to: channel,
                        message: "\nIt has been `"+diffDays+"` day(s) since Erica was last mad.\nThe record is `"+erica.record+"` day(s).\nThe last reason was `"+erica.reason+"`.\nAn average of `"+(erica.total+diffDays)/(erica.count)+"` days between arguments.\n`"+erica.count+"` total arguments."
                    });
                }
            }
         });
        return true;
    },
    test: function(test){
        test('DSEM Test', function(t){
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("since Erica was last mad.") > -1);
            };

            exports.command.func(null, null, "", ["dsem"], "", bot);
        });
    }
};