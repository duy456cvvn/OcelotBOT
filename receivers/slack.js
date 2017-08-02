const  	RtmClient       = require('@slack/client').RtmClient,
		WebClient       = require('@slack/client').WebClient,
		CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS,
		RTM_EVENTS      = require('@slack/client').RTM_EVENTS,
		config			= require('config');

const SLACK_EMOJI_EQUIV = {
	"🔤": "abc",
	"🆎": "ab",
	"🆔": "od",
	"🆚": "vs",
	"🆗": "ok",
	"🆒": "cool",
	"🇴": "o",
	"🅾": "o2",
	"⭕": "o",
	"🔄": "arrows_counterclockwise",
	"🔃": "arrows_clockwise",
	"🔟": "keycap_ten",
	"💯": "100",
	"🆕": "new",
	"🆖": "ng",
	"🆓": "free",
	"🆑": "cl",
	"🚾": "wc",
	"🆘": "sos",
	"🏧": "atm",
	"🆙": "up",
	"🔚": "end",
	"🔙": "back",
	"🔛": "on",
	"🔝": "top",
	"🔜": "soon",
	"📴": "mobile_phone_off",
	"➿": "loop",
	"💲": "heavy_dollar_sign",
	"❗": "exclamation",
	"❕": "grey_exlamation",
	"⚠": "warning",
	"‼": "bangbang",
	"™": "tm",
	"🅰": "a",
	"🇦": "letter_a",
	"🅱": "b",
	"🇧": "letter_b",
	"🇨": "c",
	"©": "copyright",
	"↪": "arrow_right_hook",
	"🇩": "d",
	"🇪": "e",
	"📧": "email",
	"🇫": "f",
	"🇬": "g",
	"🇭": "h",
	"🇮": "i",
	"ℹ": "information_source",
	"🇯": "j",
	"♊": "gemini",
	"👁👁‍": "eye",
	"🇰": "k",
	"🇱": "l",
	"🇲": "letter_m",
	"🇳": "n",
	"Ⓜ": "m",
	"〽": "part_alternation_mark",
	"👁‍": "eye",
	"🔅": "low_brightness",
	"🔆": "high_brightness",
	"🇵": "p",
	"🅿":"parking",
	"🇶": "q",
	"🇷": "r",
	"®": "registered",
	"🇸": "letter_s",
	"💰": "moneybag",
	"🇹": "t",
	"🇺": "u",
	"🇻": "v",
	"🇼": "w",
	"🇽": "letter_x",
	"❌": "x",
	"✖": "heavy_multiplication_x",
	"❎": "negative_squared_cross_mark",
	"🇾": "y",
	"🇿": "z",
	"💤": "zzz"
};

const WS_CLOSE_CODES = {
	1000: "CLOSE_NORMAL",
	1001: "CLOSE_GOING_AWAY",
	1002: "CLOSE_PROTOCOL ERROR",
	1003: "CLOSE_UNSUPPORTED",
	1004: "RESERVED",
	1005: "CLOSE_NO_STATUS",
	1006: "CLOSE_ABNORMAL",
	1007: "Unsupported data",
	1008: "Policy violation",
	1009: "CLOSE_TOO_LARGE",
	1010: "Missing Extension",
	1011: "Internal Error",
	1012: "Service Restart",
	1013: "Try Again Later",
	1014: "RESERVED",
	1015: "TLS Handshake failure",
	4000: "Discord: Unknown Error",
	4001: "Discoed: Unknown Opcode",
	4002: "Discoed: Decode Error",
	4003: "Discord: Not Authenticated",
	4004: "Discord: Authentication Failed",
	4005: "Discord: Already Authenticated",
	4007: "Discord: Invalid Sequence",
	4008: "Discord: Rate Limited",
	4009: "Discord: Session Timeout",
	4010: "Discord: Invalid Shard",
	4011: "Discord: Sharding Required"
};


module.exports = function(bot){
	var obj = {
		name: "Slack Message Receiver",
		id: "slack",
		init: function init(namespace, cb){
			namespace.rtm = new RtmClient(config.get("Slack.botToken"));
			namespace.web = new WebClient(config.get("Slack.botToken"));
			namespace.web_p = new WebClient(config.get("Slack.userToken"));
			bot.log("Starting Slack...");
			namespace.rtm.start();

			namespace.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function rtmAuthEvent(){
				bot.log("RTM Client authenticated.");
			});

			namespace.rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, function wsErrorEvent(data){
				bot.error("RTM WebSocket error:");
				bot.log(data);
			});

			namespace.rtm.on(CLIENT_EVENTS.RTM.WS_CLOSE, function wsCloseEvent(data){
				bot.warn("RTM Websocket closed with code: "+(WS_CLOSE_CODES[data] ? WS_CLOSE_CODES[data] : data));
			});

			namespace.rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, function disconnectEventEvent(data){
				bot.error("RTM Client disconnected, not attempting to reconnect.");
			});

			namespace.rtm.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, function attemptingReconnectEvent(data){
				bot.warn("RTM Client disconnected, attempting to reconnect.");
				setTimeout(function(){
					namespace.rtm.start();
				}, 10000);
			});

			namespace.rtm.on(CLIENT_EVENTS.WEB.RATE_LIMITED, function rateLimitEvent(data){
				bot.warn("Web request rate limited:");
				bot.log(data);
			});

			namespace.rtm.on(RTM_EVENTS.MESSAGE, function (messageData) {
				var message = messageData.text;
				var channelID = messageData.channel;
				var user = "<"+messageData.user+">";
				var userID = messageData.user;

				bot.receiveMessage(user, userID, channelID, message, messageData, obj.id);
			});
		},
		sendMessage: function sendMessage(opts, cb) {
			bot.receivers.slack.internal.rtm.sendMessage(opts.message, opts.to, cb);
		},
		/**
		 * Get the server Snowflake that a channel belongs to
		 * @param {string} channel
		 * @param cb {function} callback
		 * @returns {string}
		 */
		getServerFromChannel: function getServerFromChannel(channel, cb){

		},
		getServerInfo: function(server, cb){
			cb(null, {});
		},
		getChannelInfo: function(channel, cb){
			cb(null, {});
		},
		getUser: function getUser(id, cb){
			bot.receivers.slack.internal.web.users.info(id, function(err, data){
				if(err)
					cb(err);
				else{
					cb(null, {
						id: data.user.id,
						username: data.user.name,
						avatar
					})
				}
			});
		},
		simulateTyping: function simulateTyping(channel, cb){
			bot.receivers.slack.internal.rtm.sendMessage(channel);
			if(cb){
				cb();
			}
		},
		uploadFile: function uploadFile(data, cb){
			var opts = {};
			if(typeof data.file == "string"){
				opts.file = fs.createReadStream(data.file);
			}else{
				opts.content = data.file;
			}
			opts.channels = data.to;
			opts.filetype = data.filetype;
			opts.title = data.message;

			bot.receivers.slack.internal.web_p.files.upload(data.filename, opts, cb);
		},
		sendAttachment: function sendAttachment(channel, text, attachments, cb){
			bot.receivers.slack.internal.web.chat.postMessage(channel, text, {attachments: attachments}, cb);
		},
		editMessage: function editMessage(data, cb){
			bot.receivers.slack.internal.web.chat.update(data.messageID, data.channel || data.channelID, data.message, cb ? cb : null)
		},
		addReaction: function addReaction(data, cb){
			bot.receivers.slack.internal.web.reactions.add(SLACK_EMOJI_EQUIV[data.reaction] || data.reactionName, {
				channel: data.channelID,
				timestamp: data.messageID
			}, cb);
		},
		getReaction: function getReaction(opts, cb){

		},
		getMessages: function getMessages(opts, cb){

		},
		getStats: function getStats(cb){
			cb({
				uptime: process.uptime(),
				servers: Object.keys(bot.receivers.discord.internal.client.servers).length,
				users: Object.keys(bot.receivers.discord.internal.client.users).length,
				messageCount: bot.totalMessages,
				messagesSent: obj.messageCount
			});
		},
		call: function call(func, args, cb){
			if(cb)
				args.push(cb);
			bot.receivers.slack.internal.client[func].apply(args);
		},
		eval: function(text, cb){
			if(cb){
				try {
					cb(null, eval(text));
				}catch(e){
					cb(e);
				}
			}else{
				eval(text);
			}
		},
		setMessage: function(text){

		},
		getServers: function getServers(cb){

		},
		getUsers: function getUsers(cb){

		},
		getChannels: function getChannels(cb){

		},
		getInstances: function getInstances(cb){
			cb(null, bot.availableInstances);
		},
		getBusyInstances: function getBusyInstances(cb){
			cb(null, bot.busyInstances);
		}
	};
	return obj;
};