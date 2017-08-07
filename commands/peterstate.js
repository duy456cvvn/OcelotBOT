/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const config = require('config');
const states = config.get("Commands.peterstate.states");


const facts = [
	"Peter has re-ocurring dreams in which **Ed Sheeran** is his friend.",
	"Peter's favourite genre of music is **shitty 90s/noughties love ballads**.",
	"Peter spends over **50%** of his time on his computer.",
	"Peter once pretended he was left handed for **4 months** because he couldn't admit his mistake.",
	"Peter spends **1/3rd** of his time asleep. Like most humans.",
	"If Peter doesn't have his vitamins in the morning, he turns into the weak version of **The Hulk**.",
	"Peter is allergic to **dust** and **citrus fruit**.",
	"Peter did try and automatically record sex using sensors, but his girlfriend wouldn't allow it.",
	"Peter plays <:Overwatch:230070017390149632> **Overwatch**: Peter#25877",
	"Peter once got stranded for **4 hours** in a town within walking distance of his house.",
	"Bragging about **Reddit Karma** is not a good way to impress a girl.",
	"Peter has a weird ability to remember numbers that contain a **9**.",
	"Peter works for a company his mum compared to the **Hitler Youth**.",
	"Hiding a **fire extinguisher** in your room is not a good way to impress a girl.",
	"Peter kept track of how many times his ex got mad at him. The longest break between arguments was **5 days**",
	"Peter once pretended a girl was his **sister** purely for banter.",
	"Some times Peter remembers a **snail** he stepped on a few years ago and feels sad.",
	"Peter spends **too much money** on **useless shit**.",
	"Saying **'Any Hole's A Goal'** is not a good way to impress a girl.",
	"Peter's average bed time this month is **4AM**",
	"Peter went to comicon in a **cardboard box**. He'll show you pictures if you ask nicely.",
	"Peter knows **2^31** off by heart.",
	"Peter's nickname in primary school was **worm boy**...",
	"Peter once **fainted** because he stood up for too long.",
	"Peter once had a **canoe** on his roof."
];
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
                        recv.sendMessage({
                            to: channel,
                            message: err
                        });
                    }else{
                        try {
                            var data = JSON.parse(body);
                            if (data.err) {
                                recv.sendMessage({
                                    to: channel,
                                    message: ":bangbang: Error getting data from Petify:\n```\n"+JSON.stringify(data.err)+"\n```"
                                });
                            } else {
                                bot.database.getPetermonLastOutside()
                                    .then(function(outside){
                                    	const now = new Date();
                                        const lastTimeOutside = new Date(outside[0].timestamp);
                                        const timeInside = now-lastTimeOutside;
										const peter = result[0];
										recv.sendAttachment(channel,":information_source: **Fun Fact:** " + ( timeInside >= 8.64e+7 ? `The last time peter left the house was **${bot.util.prettySeconds(parseInt(timeInside/1000))}** ago.` : bot.util.arrayRand(facts)), [
											{
												fallback: "...",
												color: "#4d41ef",
												title: `Peter's last state was: ${states[peter.state] || peter.state}`,
												text: peter.state === "Home" ? `:musical_note: Listening to **[${data.artist_name} - ${data.title}](https://unacceptableuse.com/petify/song/${data.song_id}/-%7C)**` : `Last update: ${peter.timestamp}`,
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
                                    })
									.catch(function(err){
										recv.sendMessage({
											to: channel,
											message: ":bangbang: Error figuring out when peter last left the house. Try again later."
										});
										bot.error(err.stack);
									});
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