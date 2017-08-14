module.exports = {
	name: "Language",
	usage: "lang",
	accessLevel: 0,
	commands: ["lang", "language", "setlang"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		var currentLanguage = await bot.database.getServerLanguage(server)[0].language;

	}
};