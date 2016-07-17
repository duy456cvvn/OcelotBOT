var SourceQuery = require('sourcequery');
var sq = new SourceQuery(1000);
var gameColours = {
  tf: "#9C5220",
  garrysmod: "#1295F0"
};
exports.command = {
	name: "serverinfo",
	desc: "Get information about a source based multiplayer server",
	usage: "serverinfo <server> [port]",
    onReady: function(bot){
        bot.registerInteractiveMessage("serverinfo", function(name, val, info){
            var stuff = val.split(":");
            var ip = stuff[0];
            var port = stuff[1];
            sq.open(ip, port ? port : 27015);
            sq.getPlayers(function sourceQueryPlayers(err, players){
               if(err){
                   bot.web.chat.update(info.original_message.ts, info.channel.id, "Error: "+err);
               } else{
                   if(players.length === 0){
                       bot.web.chat.update(info.original_message.ts, info.channel.id, "There's nobody online...");
                   }else{
                       var output = "*Online players:*\n ";
                       for(var i in players){
                             output+=players[i].name+"\n";
                       }
                       bot.web.chat.update(info.original_message.ts, info.channel.id, output);
                   }

               }

                sq.close();
            });
        });
    },
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;

		if(args[1] == "doublecross"){
			args[1] = "193.111.142.33";
			args[2] = "27021";
		}else if(args[1] == "anex"){
			args[1] = "89.34.96.39";
			args[2] = "27225";
		}
		sq.open(args[1], args[2] ? args[2] : 27015);
		sq.getInfo(function sourceQueryInfo(err, info){
			bot.log("Retrieved server info for "+args[1]);
			if(err){
				bot.sendMessage({
					to: channel,
					message: "Error retrieving server information: "+err
				});
			}else{

				bot.sendAttachment(channel, "\n", [{
					fallback:   `_\n*${info.name}* (${info.players}+${info.bots}/${info.maxplayers}) steam://connect/${args[1]}:${args[2]}\n`+
                                `\`map\`: ${info.map}\n`+
                                `\`game\`: ${info.game}\n`+
                                `\`version\`:${info.version}\n`+
                                `\`folder\`: ${info.folder}`,
                    color: gameColours[info.folder] ? gameColours[info.folder] : "#45a569",
                    author_name: info.name,
                    author_link: `steam://connect/${args[1]}:${args[2]}`,
                    author_icon: `https://unacceptableuse.com/ocelotbot/${info.folder}.png`,
                    fields: [
                        {
                            title: "Players",
                            value: `${info.players}+${info.bots}/${info.maxplayers}`,
                            short: true
                        },
                        {
                            title: "Map",
                            value: info.map,
                            short: true
                        },
                        {
                            title: "Gamemode",
                            value: info.game,
                            short: true
                        },
                        {
                            title: "Version",
                            value: info.version,
                            short: true
                        }
                    ],
                    "callback_id": "serverinfo",
                    actions: [
                        {
                            text: "View Players",
                            name: "viewplayers",
                            value: `${args[1]}:${args[2]}`,
                            type: "button"
                        }
                    ]
				}]);


			}

            sq.close();

		});

        return true;
	},
    test: function(test){
        test.todo("serverinfo invalid test");
        test.todo("serverinfo host test");
        test.todo("serverinfo no port test");
        test.todo("serverinfo ip test");
        test('serverinfo no arguments', function(t){
            t.false(exports.command.func(null, null, "", ["serverinfo"], "", null));
        });
    }
};