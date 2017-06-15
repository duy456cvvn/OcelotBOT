/**
 * Created by Peter on 04/04/2017.
 */
const fs = require('fs');


const euph = [
    "had a bit of the old in-out, in-out",
    "done some aggressive cuddling",
    "baked the potato",
    "attacked the pink fortress",
    "had adult naptime",
    "batter-dipped the corndog",
    "boned",
    "boinked",
    "brought the al dente noodle to the spaghetti house",
    "bruised the beef curtains",
    "churned the butter",
    "gone spelunking",
    "gone cave diving",
    "completed the jigsaw puzzle",
    "danced the goat's jig",
    "dinky-tickled",
    "dipped the crane in the oil well",
    "disappointed",
    "done the nasty",
    "done the hibbety-dibbety",
    "done the do",
    "drove miss daisy",
    "enraged the cave",
    "dunked his dairy-lea dunker",
    "filled the cream donut",
    "fished for kippers",
    "fixed the clap flap",
    "bashed genitals",
    "bumped uglies",
    "had relations",
    "greased the loaf pan",
    "glazed the donut",
    "licked the bowl out",
    "gone to the store",
    "done the jiggery pokery",
    "made bacon",
    "skinned the cat",
    "shot the meat rocket into the sausage wallet",
    "explored the blackhole with his telescope",
    "put sour cream in the burrito",
    "batter-dipped the cranny axe",
    "pressure washed the quiver bone in the bitch wrinkle",
    "power drilled the yippee bog with the dude piston",
    "marinated the nether rod in the squish mitten",
    "retrofitted the pudding hatch",
    "put the you know what in the you know where",
    "made the beast with two backs",
    "made cookies",
    "discussed the bills",
    "had a budget meeting",
    "had coffee",
    "revised",
    "engaged in venereal combat",
    "performed hot beef injection",
    "used his clamhammer",
    "booked a one way ticket to Pound Town (In Carriage D)",
    "smashed pissers",
    "slapped skin",
    "hidden the weasel",
    "parked the porpoise",
    "doubled her entendres",
    "parked the beef bus in tuna town",
    "slapped sloppies",
    "drowned the slippery otter",
    "harpooned the longshoreman",
    "verbed the objective noun",
    "snu snu'd",
    "played hide the pickle",
    "done the horizontal monster mash",
    "blew love snot in the meat kleenex",
    "netflix and chilled",
    "done the struggle cuddle",
    "been up to his nuts in guts",
    "pinged 8.8.8.8",
    "went gardening",
    "let the little white astronauts cross into the space dock",
    "moved the fridge",
    "ate cold pizza",
    "played tetris",
    "stirred the chilli",
    "devalued the pound",
    "renovated bikini bottom",
    "put the pussy on the chainwax",
    "*NOW WE KNOW*",
    "gone halves on a baby",
    "spread his man seed",
    "made a girl cry",
    "jumped in the puddle",
    "played in the rain",
    "called the stork",
    "speared the bearded clam",
    "scarred his parents",
    "done the deed",
    "hid the salami",
    "http://unacc.eu/85cd9880.png",
    "let off the spunklear bomb inside hiroshicunt"
];
exports.command = {
    name: "jhswa",
    desc: "Just Had Sex With Abbey",
    usage: "jhswa [times]",
    func: function(user, userID, channel, args, message, bot){
        if(bot.isDiscord)return true;
        var abbey = {times: 0, total: 0, lastFuck: 0, record: 0, sexTimes: []};
        var now = new Date().getTime();

        fs.readFile('abbey.json', function(err, data){
            if(err){
                bot.sendMessage({
                    to: channel,
                    message: "Couldn't open file. "+err
                });
            }else{
                abbey = JSON.parse(data);

                var timeDiff = Math.abs(now - abbey.lastFuck);


                if(args[1]){
                    var times = parseInt(args[1]);
                    abbey.lastFuck = now;
                    abbey.times += times;
                    abbey.total++;
                    abbey.sexTimes.push({date: now, times: times});
                    if(times > abbey.record){
                        abbey.record = times;
                    }
                    fs.writeFile("abbey.json", JSON.stringify(abbey), function(err) {
                        if(err) {
                            bot.sendMessage({
                                to: channel,
                                message: "Couldn't reset: "+err
                            });
                        }
                    });
                    bot.sendMessage({
                        to: channel,
                        message: "https://unacceptableuse.com/petify/song/9548c052-8696-4d32-b43b-ac4b680166c0/-"
                    });
                }else{
                    bot.sendMessage({
                        to: channel,
                        message: `Peter has ${euph[parseInt(Math.random()*euph.length)]} *${abbey.times}* times in total. With a record of *${abbey.record}* times in 1 day.`
                    });
                }
            }
        });
        return true;
    }
};