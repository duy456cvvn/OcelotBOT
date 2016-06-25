var SourceQuery = require('sourcequery');
var sq = new SourceQuery(1000);
exports.command = {
	name: "serverinfo",
	desc: "Get information about a source based multiplayer server",
	usage: "serverinfo <server> [port]",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;

		if(args[1] == "doublecross"){
			args[1] = "193.111.142.33";
			args[2] = "27021";
		}else if(args[1] == "dh"){
			args[1] = "185.38.148.28"; 
			args[2] = "27225";
		}
		sq.open(args[1], args[2] ? args[2] : 27015);
		sq.getInfo(function(err, info){
			console.log("[SERVERINFO] Retrieved server info for "+args[1]);
			if(err){
				bot.sendMessage({
					to: channel,
					message: "Error retrieving server information: "+err
				});
			}else{
				bot.sendMessage({
					to: channel,
					message: "_\n*"+info.name+"* ("+info.players+"+"+info.bots+"/"+info.maxplayers+") steam://connect/"+args[1]+":"+args[2]+"\n`map`: "+info.map+"\n`game`: "+info.game+"\n`version`:"+info.version+"\n`folder`:"+info.folder
				});
			}

		});

        return true;
	}
};