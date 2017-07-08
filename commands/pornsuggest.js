var http = require('https');
exports.command = {
	name: "pornsuggest",
	desc: "Suggest some porn",
	usage: "pornsuggest",
	func: function(user, userID, channel, args, message, bot){
		http.get("https://www.pornmd.com/getliveterms?country="+(args[1] ? args[1] : "")+"&orientation="+o[parseInt(Math.random() * o.length)], function(response){
			var body = "";
	        response.on('data', function (chunk) {
	            body += chunk;
	        });
	        response.on('end', function () {
	            try {
                    var names = JSON.parse(body);
                    if (names[0].message) {
                        bot.sendMessage({
                            to: channel,
                            message: names[0].message
                        });
                    } else {
                        bot.sendMessage({
                            to: channel,
                            message: "Feeling horny? Try *" + (names[parseInt(Math.random() * names.length)].keyword) + "*"
                        });
                    }
                }catch(e){
                    bot.sendMessage({
                        to: channel,
                        message: "Feeling horny? Try *" + e + "*"
                    });
                    console.log(e);
                }
                // bot.sendMessage({
                //     to: channel,
                //     message: "Feeling horny? Try *"+(body.replace(/"/g,""))+"*"
                // });
	      	});
			
		});

        return true;
	},
	test: function(test){
        test.cb('pornsuggest', function(t){
            t.plan(2);
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("Feeling horny?") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["pornsuggest"], "", bot));
        });
	}
};