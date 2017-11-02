/**
 * Created by Peter on 18/10/2017.
 */
const compliments = require('config').get("Commands.compliment.compliments");
module.exports = {
	name: "Compliment",
	usage: "compliment <person>",
	accessLevel: 0,
	commands: ["compliment", "complement", "complament"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!args[1]){
			recv.sendMessage({
				to: channel,
				message: ":bangbang: "+await bot.lang.getTranslation(server, "INVALID_USAGE")+" !compliment <person>"
			})
		}else{
			if(args[1].toLowerCase() === "ocelotbot" || args[1].indexOf("146293573422284800") > -1){
				recv.sendMessage({
					to: channel,
					message: "It's been a while. I've missed you. It's okay, you can look at my butt. I feel like I can be vulnerable around you Do you like this tree I made? Cool, right? I thought it was cool. It's so hard to make things sometimes, you know? It just takes so much mental energy and I get so tired. I just wanna sit here and relax with you.\n" +
					"Wow, check out this sunset. It's so nice to stop and take all this in. Really makes you enjoy being alive. Even you. I love looking at you. I want to remember all your shapes\n" +
					"Ah, beautiful\n" +
					"I've been thinking about you a lot lately. I see you trying to do so many things at once, worrying about a decision you made, or worried that you said the wrong thing to someone. You're so hard on yourself. But you're wonderful and worthy of being loved. You really are. You just have to let yourself believe it.\n" +
					"Well, I know you're really busy, and you probably have to go but I'm glad I got to see you for a minute.\n" +
					"I love you"
				});
			}else{
				recv.sendMessage({
					to: channel,
					message: `${message.substring(args[0].length+1)}, ${bot.util.arrayRand(compliments)}`
				});
			}
		}

	}
};