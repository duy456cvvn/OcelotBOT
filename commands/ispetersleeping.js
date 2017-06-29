var request = require('request');

exports.command = {
	name: "peterstate",
	desc: "Where's Peter?",
	usage: "peterstate",
	func: function(user, userID, channel, args, message, bot){

        const states = {
            "Unknown": ":interrobang: Unknown?",
            "Home": (bot.isDiscord ? ":house_abandoned:" : ":derelict_house_building:") + " Sat at home, on his own probably.",
            "Outside": ":walking: Outside, probably busy.",
            "College": ":school: At College, probably in an exam.",
            "Sleeping": ":zzz: Asleep. Shhh.",
            "Abbeys": ":ok_hand: :point_left: At Abbey's house. Probably boning."
        };

        bot.connection.query("SELECT * FROM pm_status ORDER BY timestamp DESC LIMIT 1", function(err, result){
            request(`https://unacceptableuse.com/petify/api/${bot.config.petify.apiKey}/nowPlaying/${bot.config.petify.users["139871249567318017"]}`, function(err, resp, body){
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: err
                    });
                }else{
                    try {
                        var data = JSON.parse(body);
                        if (data.err) {
                            bot.sendMessage({
                                to: channel,
                                message: "Error getting data from Petify:\n```\n"+JSON.stringify(data.err)+"\n```"
                            });
                        } else {
                            var peter = result[0];
                            bot.sendAttachment(channel, "", [
                                {
                                    fallback: "...",
                                    color: "#4d41ef",
                                    title: `Peter's last state was: ${states[peter.state] || peter.state}`,
                                    text: peter.state === "Home" ? `:musical_note: Listening to **${data.artist_name} - ${data.title}**` : `Last update: ${peter.timestamp}`,
                                    fields: [
                                        {
                                            title: "Heart Rate",
                                            value: peter.peter_heartrate+" BPM",
                                            short: true
                                        },
                                        {
                                            title: "Room Temperature",
                                            value: peter.inside_temp+" C",
                                            short: true
                                        },
                                        {
                                            title: "Phone Battery",
                                            value: peter.jimmy_battery+"%",
                                            short: true
                                        },
                                        {
                                            title: "Phone Temperature",
                                            value: peter.jimmy_light+" C",
                                            short: true
                                        },
                                        {
                                            title: "Speed",
                                            value: peter.jimmy_speed+" m/s",
                                            short: true
                                        },
                                        {
                                            title: "Altitude",
                                            value: peter.jimmy_altitude+" m above sealevel.",
                                            short: true
                                        }
                                    ]
                                }
                            ]);
                        }
                    }catch(e){
                        bot.sendMessage({
                            to: channel,
                            message: "Error: "+e
                        });
                        bot.log(body);
                    }
                }
            });
        });
        return true;
	},
    test: function(test){
        //test.cb('ispetersleeping test', function(t){
        //    t.plan(2);
        //    var bot = {};
        //
        //    bot.sendMessage = function(data){
        //        t.true(data.message.indexOf("error") === -1 && data.message.indexOf("Schrodinger") === -1);
        //        t.end();
        //    };
        //
        //    t.true(exports.command.func(null, null, "", ["ispetersleeping"], "", bot));
        //});
    }
};


