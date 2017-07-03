/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "stats",
    run: function run(user, userID, channel, message, args, event, bot, recv){

        recv.sendAttachment(channel, "", [{
            fallback: `fuck you`,
            color: "#ffffff",
            title: "OcelotBOT v4 Technical Statistics",
            text: `Uptime: ${bot.util.prettySeconds(process.uptime()/1000)}`,
            fields: [
                {
                    title: "Modules Loaded",
                    value: bot.util.numberWithCommas(Object.keys(require.cache).length),
                    short: true
                },
                {
                    title: "OcelotBOT Modules Loaded",
                    value: `**${Object.keys(bot.loadBefore).length}** pre-receiver modules / **${Object.keys(bot.loadAfter).length}** post-receiver modules.`,
                    short: true
                },
                {
                    title: "Commands Loaded",
                    value: `**${Object.keys(bot.commands).length}** commands.`,
                    short: true
                },
                {
                    title: "Message Receivers",
                    value: `**${Object.keys(bot.receivers).length}** message receivers loaded. (${Object.keys(bot.receivers).join(", ")})`,
                    short: false
                },
                {
                    title: "Message Handlers",
                    value: `**${Object.keys(bot.messageHandlers).length}** message handlers loaded. (${Object.keys(bot.messageHandlers).join(", ")})`,
                    short: false
                },
                {
                    title: "This Session",
                    value: `**${bot.commandCount}** commands. **${bot.errorCount}** errors.`,
                    short: true
                },
                {
                    title: "Discord Message Queue",
                    value: `${bot.receivers.discord.messageCount} messages sent. Average ${(bot.receivers.discord.totalMessageTime/bot.receivers.discord.messageCount).toFixed(2)} ms wait time.`,
                    short: true
                }
            ]
        }]);
    }
};