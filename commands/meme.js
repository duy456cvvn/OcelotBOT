exports.command = {
	name: "meme",
	desc: "Memes",
	usage: "meme <meme/list/add <name> <url>>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;
		if(args[1] === "list"){
			bot.connection.query("SELECT `name` FROM stevie.Memes;", function (err, result) {
				if(err){
					bot.sendMessage({
						to: channel,
						message: "Error listing memes: "+err
					});
				}else{
					var stb = "**Available Memes:** ";
					for(var i in result){
						stb += result[i].name+" "
					}
					bot.sendMessage({
						to: channel,
						message: stb
					});
				}	
			});
		}else if(args[1] === "add"){
			if(args.length < 4)return false;
			bot.connection.query("INSERT INTO `stevie`.`Memes` (`name`,`url`) VALUES (?,?);", [args[2], args[3]], function (err, result) {
				if(err){
					bot.sendMessage({
						to: channel,
						message: "Error adding meme: "+err
					});
				}else{
					bot.sendMessage({
						to: channel,
						message: "Meme added."
					});
				}
			});
		}else{
			bot.connection.query("SELECT `url` FROM stevie.Memes WHERE `name` = ?;", [args[1]], function (err, result) {
				if(err){
					bot.sendMessage({
						to: channel,
						message: "Error getting meme: "+err
					});
				}else{
					if(result.length < 1){
						bot.sendMessage({
							to: channel,
							message: "Meme not found, try !meme list"
						});
					}else{
						bot.sendMessage({
							to: channel,
							message: result[0].url
						});
					}
				}
			});
		}	
	  	return true;
	}
};