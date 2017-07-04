/**
 * Created by Peter on 09/06/2017.
 */
const config = require('config');
module.exports = {
    name: "Stats Command",
    usage: "stats",
    accessLevel: 0,
    commands: ["stats", "statistics", "info"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
           recv.sendMessage({
               to: channel,
               message: "",
               embed: {
                   color: 0x189F06,
                   title: "OcelotBOT Version `stevie4`",
                   description: recv.id === "discord" ? `You are being served by **shard #${config.get("Discord.shard")}**` : "",
                   fields: [
                       {
                           name: "Shard Total Servers",
                           value: bot.util.numberWithCommas(Object.keys(recv.internal.client.servers).length),
                           inline: true
                       },
                       {
                           name: "Shard Total Users",
                           value: bot.util.numberWithCommas(Object.keys(recv.internal.client.users).length),
                           inline: true
                       },
                       {
                           name: "Current Shard Uptime",
                           value: bot.util.prettySeconds(process.uptime()),
                           inline: true
                       },
                       {
                           name: "OcelotBOT Age",
                           value: bot.util.prettySeconds((new Date() - 1390089600000)/1000),
                           inline: true
                       },
                       {
                           name: "Message Stats",
                           value: `**${recv.messageCount}** total messages sent from this shard. **${(recv.totalMessageTime/recv.messageCount).toFixed(2)} ms** average response time.`,
                           inline: false
                       }
                   ]
               }
           });
    }
};

