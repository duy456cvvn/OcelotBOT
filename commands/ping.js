/**
 * Created by Peter on 01/07/2017.
 */
const ping = require('ping');
module.exports = {
    name: "Ping Address",
    usage: "ping <address> [timeout] [times]",
    accessLevel: 0,
    commands: ["ping"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter an address to ping. i.e. !ping google.com"
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: `:watch: Pinging ${args[1]}...`
            }, async function(err, resp){
                var id = resp.ts || resp.id;

               const res = await ping.promise.probe(args[1].replace(/[<>|]/g, ""), {
                        timeout: args[2] ? args[2] : 1000,
                        extra: args[3] ? [" -c "+args[3]] : ""
                    });
				if(res.alive){
					recv.editMessage({
						channelID: channel,
						messageID: id,
						message: `:white_check_mark: Received response: \n\`\`\`${res.output}\n\`\`\``
					});
				}else{
					recv.editMessage({
						channelID: channel,
						messageID: id,
						message: ":negative_squared_cross_mark: Received no response from host."
					});
				}
            });
        }
    }
};