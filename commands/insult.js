var insults = [
	"your mother was a hamster and your father smelt of elderberries,",
	"everyone just tolerates you.",
	"your parents never really loved you.",
	"you must've been born on a highway, that's where most accidents happen.",
	"your birth certificate is an apology from the condom factory.",
	"fuck you",
	"your face makes me laugh",
	"you disgust me",
	"every fibre of my being despises you.",
	"your mum should've swallowed.",
	"you're a real cunt, you know that?",
	"you make me sick",
	"you make me physically ill.",
	"I can't stand the sight of you",
	"why play so hard to get when you're so hard to want?",
	"you are one of those people who would be enormously improved by death.",
	"now I see why everyone talks about you behind your back.",
	"you look like a *before* picture.",
	"your gene pool needs a ltitle chlorine",
	"if you were any more inbread you'd be a sandwich",
	"you're not pretty enough to be this stupid",
	"I'd challenge you to a battle of wits, but I see you're unarmed.",
	"I'm not saying you're fat, but you look like someone poured you into your clothes and you forgot to say when.",
	"what doesn't kill you...disappoints me.",
	"you couldn't pour water out of a boot if the instructions were on the sole.",
	"why are you even here?",
	"your mother is so old she has a separate entrance for black men.",
	"the best part of you ran down your mother's legs",
	"anyone who ever loved you was wrong.",
	"you're like the top piece of bread. Everybody touches you, but nobody wants you.",
	"you have enough extra chromosomes to make a friend."
];


exports.command = {
	name: "insult",
	desc: "Insult a user",
	usage: "insult <user>",
	func: function(user, userID, channel, args, message, bot){

		bot.sendMessage({
            to: channel,
            message: args[1]+", "+insults[parseInt(Math.random() * insults.length)]
        });
        return true;
	},
	test: function(test){
		test.cb('Insult test', function(t){
			var bot = {};
			bot.sendMessage = function(data){
                t.true(data.message.indexOf("test") > -1);
				t.end();
			};

			t.true(exports.command.func(null, null, "", ["insult", "test"], "", bot));
		});
	}
};
