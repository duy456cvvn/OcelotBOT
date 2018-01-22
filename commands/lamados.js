const fs = require('fs');
module.exports = {
	name: "Sad Counter",
	usage: "lamados",
	accessLevel: 0,
	commands: ["lamados", "sad"],
	run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		fs.readFile("./lamados.txt", async function(err, data){
			if(err){
				bot.raven.captureException(err);
				recv.sendMessage({
					to: channel,
					message: await bot.lang.getTranslation(server, "LAMADOS_ERROR")
				});
			}else{
				recv.sendMessage({
					to: channel,
					message: await bot.lang.getTranslation(server, "LAMADOS_MESSAGE", data)
				});
			}
		});
	}
};
