var http = require('http');
var request = require('request');
var session;
exports.command = {
	name: "peterstate",
	desc: "Where's Peter?",
	usage: "peterstate",
	func: function(user, userID, channel, args, message, bot){
        console.log("[ISPETERSLEEPING] Logging in to "+bot.config.petermon.url+"...");

        request.post(
            {
                url: bot.config.petermon.url+"login",
                form: {
                    username: bot.config.petermon.username,
                    password: bot.config.petermon.password
                }
            },
            function(err, resp, body){
                console.log("[ISPETERSLEEPING] Received login response.");
                if(err){
                    bot.sendMessage({
                        to: channel,
                        message: "There was an error communicating with petermon (during login): `"+err+"`"
                    });
                }else{
                    session = resp.headers['set-cookie'][0].split(";")[0]+";";
                    request({
                        url: bot.config.petermon.url+"state/get/info",
                        headers: {
                            "Cookie": session
                        }
                    }, function(err, resp, body){
                        console.log("[ISPETERSLEEPING] Received state response");
                        try {
                            body = JSON.parse(body);
                            if (err) {
                                bot.sendMessage({
                                    to: channel,
                                    message: "There was an error communicating with petermon (during state get): `" + err + "`"
                                });
                            } else {
                                bot.sendMessage({
                                    to: channel,
                                    message: body.description
                                });
                            }
                        }catch(e){
                            bot.sendMessage({
                            	to: channel,
                            	message: "Peter appears to be in an impossible state. Like Schrodinger's cat, he is in all possible states at once.\n"+e
                            });
                        }
                        });

                }
            });
		
        return true;
	}
};


