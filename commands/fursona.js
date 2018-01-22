/**
 * Created by Peter on 25/09/2017.
 */

const randomAnimals = [
	"otter",
	"whale",
	"wolf",
	"dog",
	"tiger",
	"leopard",
	"monkey",
	"cat",
	"mouse",
	"horse",
	"pig",
	"dolphin",
	"narwhal",
	"devil",
	"snowdog",
	"husky",
	"rabbit",
	"raccoon",
	"ferret",
	"eel"
];

const randomDescs = [
	"sensual",
	"horny",
	"mysterious",
	"sexual",
	"perverted",
	"gay",
	"lesbian",
	"depressed",
	"fat",
	"fast",
	"amazing",
	"wise",
	"fast",
	"spooky",
	"devilish",
	"snuggly",
	"cuddly",
	"wild",
	"shocking"
];

const randomNames = [
	"spiky",
	"amethyst",
	"devil",
	"roofus",
	"black",
	"chad",
	"dax wilde",
	"max",
	"max power",
	"daniel",
	"jack",
	"electric",
	"rick",
	"ricky",
	"nanaki",
	"dick",
	"dick weed",
	"wolf"
];

module.exports = {
	name: "Fursona Generator",
	usage: "fursona",
	accessLevel: 0,
	commands: ["fursona"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		recv.sendMessage({
			to: channel,
			message: await bot.lang.getTranslation(server, "FURSONA_MESSAGE", `${bot.util.arrayRand(randomNames)} the ${bot.util.arrayRand(randomDescs)} ${bot.util.arrayRand(randomAnimals)}`)
		});
	}
};
