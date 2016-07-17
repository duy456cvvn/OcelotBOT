var schedule = require('node-schedule'),
	parseDate= require('parse-duration'),
	fs 		 = require('fs');

var regex = new RegExp("!.*?( .* )\"(.*)\"");

var outstandingReminders = [];


exports.command = {
	name: "remind",
	desc: "Set a reminder for the future",
	usage: 'remind <in> "<message>"',
	func: function(user, userID, channel, args, message, bot){
		var rargs = regex.exec(message);
		if(!rargs || rargs.length < 3){
			return false;
		}else{
			var offset = parseDate(rargs[1]);
			if(offset === 0){
				bot.sendMessage({to: channel, message: "Unable to parse time."});
			}else{
				var at = Date.now() + offset;
				var thisIndex = outstandingReminders.length;
				outstandingReminders.push({date: at, channel: channel, user: userID, message: rargs[2]});
				bot.sendMessage({to: channel, message: "Reminding you at "+new Date(at)});
				schedule.scheduleJob(at, function triggerRuntimeReminder(){
			  		bot.sendMessage({to: channel, message: "<@"+userID+">, you told me to remind you of this: \n	"+rargs[2]});
			  		outstandingReminders.splice(thisIndex, 1);
				});

		       fs.writeFile("reminders.json", JSON.stringify(outstandingReminders), function(err) {
                    if(err) {
                        bot.sendMessage({
                            to: channel,
                            message: "Couldn't add reminder to list: "+err+"\nReminder will still work but will not persist through restarts."
                        });
                    }
                });
			}
			return true;
		}
	},
	onReady: function(bot){
		fs.readFile('reminders.json', function loadRemindersFile(err, data){
			if(err){
				bot.warn("Could not open reminders file!");
		    }else{
		    	outstandingReminders = JSON.parse(data);
		    	var now = Date.now();
		    	for(var i in outstandingReminders){
		    		var reminder = outstandingReminders[i];
		    		//if(reminder.at > now){
		    			bot.log("Loaded reminder for "+reminder.user);
			    		schedule.scheduleJob(reminder.at, function fireContinuedReminder(){
			    			bot.log("Reminder fired");
				  			bot.sendMessage({to: reminder.channel, message: "<@"+reminder.user+">, you told me to remind you of this: \n	"+reminder.message});
				  			outstandingReminders.splice(i, 1);
						});
		    		//}
		    	}
		    }
		});
	},
	test: function(test){
        test('remind no arguments', function(t){
            t.false(exports.command.func(null, null, "", ["remind"], "", null));
        });

        test.cb('remind 2 seconds', function(t){
            t.plan(3);
            var bot = {};
            bot.sendMessage = function(data){
                if(data.message.indexOf("Reminding you at") > -1){
                    t.pass();
                    setTimeout(t.fail, 3000);
                }else{
                    t.true(data.message.indexOf("test") > -1);
                    t.end();
                }
            };

            t.true(exports.command.func(null, "test", "", ["remind", "aa", "aa"], "!remind in 2 seconds \"test\"", bot));
        });
	}
};


