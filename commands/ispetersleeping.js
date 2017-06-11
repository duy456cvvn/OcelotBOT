var request = require('request');
exports.command = {
	name: "peterstate",
	desc: "Where's Peter?",
	usage: "peterstate",
	func: function(user, userID, channel, args, message, bot){
        bot.connection.query("SELECT * FROM pm_status ORDER BY timestamp DESC LIMIT 1", function(err, result){
            var peter = result[0];
            bot.sendAttachment(channel, "", [
                {
                    fallback: "...",
                    color: "#4d41ef",
                    title: "Peter's last known statistics",
                    text: `Last heard from petermon at **${peter.timestamp}**`,
                    fields: [
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
            ])
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


