/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const config = require('config');
const states = config.get("Commands.peterstate.states");
module.exports = {
    name: "Peter State",
    usage: "peterstate",
    accessLevel: 0,
    commands: ["peterstate"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        bot.database.getLastPetermonData()
            .then(function(result){
                request(`https://unacceptableuse.com/petify/api/${config.get("Commands.peterstate.petifyKey")}/nowPlaying/${config.get("Commands.peterstate.petifyUser")}`, function(err, resp, body){
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
                                    message: ":bangbang: Error getting data from Petify:\n```\n"+JSON.stringify(data.err)+"\n```"
                                });
                            } else {
                                const peter = result[0];
                                recv.sendAttachment(channel, "", [
                                    {
                                        fallback: "...",
                                        color: "#4d41ef",
                                        title: `Peter's last state was: ${states[peter.state] || peter.state}`,
                                        text: peter.state === "Home" ? `:musical_note: Listening to **${data.artist_name} - ${data.title}**` : `Last update: ${peter.timestamp}`,
                                        fields: [
                                            {
                                                title: ":heart: Heart Rate",
                                                value: peter.peter_heartrate+" BPM",
                                                short: true
                                            },
                                            {
                                                title: ":thermometer: Room Temperature",
                                                value: peter.inside_temp+" C",
                                                short: true
                                            },
                                            {
                                                title: ":battery: Phone Battery",
                                                value: peter.jimmy_battery+"%",
                                                short: true
                                            },
                                            {
                                                title: ":iphone: Phone Temperature",
                                                value: peter.jimmy_light+" C",
                                                short: true
                                            },
                                            {
                                                title: ":blue_car: Speed",
                                                value: peter.jimmy_speed+" m/s",
                                                short: true
                                            },
                                            {
                                                title: ":airplane: Altitude",
                                                value: peter.jimmy_altitude+" m above sealevel.",
                                                short: true
                                            }
                                        ]
                                    }
                                ]);
                            }
                        }catch(e){
                            recv.sendMessage({
                                to: channel,
                                message: ":bangbang: Error parsing Petify data. Try again later."
                            });
                            bot.error(e.stack);
                        }
                    }
                });
            })

    }
};