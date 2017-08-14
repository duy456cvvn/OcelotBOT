module.exports = {
	name: "Emoji Lookup",
	usage: "emoji <term>",
	accessLevel: 0,
	commands: ["emoji", "emojilookup", "lookupemoji"],
	run: async function run(user, userID, channel, message, args, event, bot, recv) {
		if(args[1]){
			recv.simulateTyping(channel);
			const result = await bot.util.emojiLookup(args[1]);
			recv.sendMessage({
				to: channel,
				message: result.length ? result.join(" ").substring(0, 2000) : await bot.lang.getTranslation(server, "EMOJI_NOT_FOUND")
			});
		}else{
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "EMOJI_NO_TERM")
			});
		}
	}
};