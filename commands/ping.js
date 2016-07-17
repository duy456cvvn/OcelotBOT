var ping = require('ping');
exports.command = {
	name: "ping",
	desc: "Ping an address",
	usage: "ping <address> [timeout] [times]",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2){
			return false;
		}

		var messageID = 0;
		bot.sendMessage({
            to: channel,
            message: "Pinging...."
        }, function(err, resp){
        	messageID = resp.ts;
			 ping.promise.probe(args[1].replace("<","").replace(">", ""))
				.then(function (res) {
					if(res.alive){
						bot.editMessage({
						    channel: channel,
						    messageID: messageID,
						    message: "Recieved response: \n```"+res.output+"\n```"
						});
					}else{
						bot.editMessage({
						    channel: channel,
						    messageID: messageID,
						    message: "Recieved no response from host."
						});
					}

				},{
					timeout: args[2] ? args[2] : 1000,
					extra: args[3] ? [" -c "+args[3]] : ""
				});
        });



        return true;
	},
	test: function(test){
        test.cb('ping valid host', function(t){
            t.plan(3);
            var bot = {};
            bot.sendMessage = function(data, cb){
                t.is(data.message, "Pinging....");
                cb(null, {});

            };

            bot.editMessage = function(data){
                t.true(data.message.indexOf("Recieved response:") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["ping", "google.com"], "", bot));
        });
        //
        test.cb('ping invalid host', function(t){
            t.plan(3);
            var bot = {};
            bot.sendMessage = function(data, cb){
                t.is(data.message, "Pinging....");
                cb(null, {});
            };

            bot.editMessage = function(data){
                t.is(data.message, "Recieved no response from host.");
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["ping", "asdansdasd"], "", bot));
        });

        test('ping no arguments', function(t){
            t.false(exports.command.func(null, null, "", ["ping"], "", null));
        });
	}
};