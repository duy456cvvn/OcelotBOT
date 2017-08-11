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
				message: result.length ? result.join(" ") : ":bangbang: No emojis found"
			});
		}else{
			recv.sendMessage({
				to: channel,
				message: ":bangbang: You must enter a search term"
			});
		}
	}
};