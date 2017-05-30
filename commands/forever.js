var forever = require('forever');


const nums = [":zero:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:"];

exports.command = {
	name: "forever",
	desc: "Interface with forever",
	usage: "forever [logs/restart/list] [id]",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2){
			return false;
		}
        //if(userID === "U1DNDKZDW" || userID === "U232Q4WQJ"){
        //    bot.sendMessage({
        //    	to: channel,
        //    	message: "lol no"
        //    });
        //    return true;
        //}
		if(args[1] === "list"){
		    var now = new Date().getTime();
			forever.list(false, function(err, info){
				var output = "\n*RUNNING FOREVER PROGRAMS:*\n";
				for(var i in info){
					var program = info[i];
					output += `${nums[i]} ${program.running ? ":white_check_mark:" : ":negative_squared_cross_mark: "} *${program.uid}* - ${prettySeconds((now - program.ctime)/1000)} - *${program.restarts} restarts*\n`;
					//output += ("["+i+"] *"+(program.uid)+"*: "+(program.running ? "RUNNING" : "STOPPED")+" ("+program.restarts+" restarts"+")\n")

				}
	        	bot.sendMessage({
		            to: channel,
		            message: output
		        });
	   		});
		}else if(args[1] === "restart"){
			if(args.length < 3)return false;
			try {
				bot.sendMessage({
					to: channel,
					message: "Restarting..."
				});
				forever.restart(args[2], true);
			}catch(e){
				bot.sendMessage({
					to: channel,
					message: e
				});
			}
		}else if(args[1] === "logs"){
			if(args.length < 3)return false;
		    var logText = "```";
		    forever.tail(args[2],{length: 40, stream: false} ,function(err, logs){
		        if(err)
		        	logText = err;
		        else
		        	logText += logs.line+"\n";
		    });
		    setTimeout(function(){
		    	bot.sendMessage({
		            to: channel,
		            message: logText+"```"
		        });
		    }, 500);
		}else{
			return false;
		}
        return true;
	},
	test: function(test){
        test.cb('Forever list test', function(t){
            t.plan(2);
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("OcelotBOT3") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["forever", "list"], "", bot));
        });

        //test.cb('Forever logs test', function(t){
        //    t.plan(2);
        //    var bot = {};
        //    bot.sendMessage = function(data){
        //        t.true(data.message.indexOf("```") > -1);
        //        t.end();
        //    };
        //
        //    t.true(exports.command.func(null, null, "", ["forever", "logs", "0"], "", bot));
        //});
	}
};

function quantify(data, unit, value) {
    if (value) {

        data.push(value + unit + ' ');
    }

    return data;
}

function prettySeconds(seconds) {

    var prettyString = '',
        data = [];

    if (typeof seconds === 'number') {

        data = quantify(data, 'd',    parseInt(seconds / 86400));
        data = quantify(data, 'h',   parseInt((seconds % 86400) / 3600));
        data = quantify(data, 'm', parseInt((seconds % 3600) / 60));
        data = quantify(data, 's', Math.floor(seconds % 60));

        var length = data.length,
            i;

        for (i = 0; i < length; i++) {
            prettyString += data[i];
        }
    }

    return prettyString;
};