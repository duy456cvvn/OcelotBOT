/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "servers",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        var fields = [];
        for(var i in bot.servers){
            var server = bot.servers[i];
            var field = {
                name: server.name,
                value: `**${server.member_count}** members. **${Object.keys(server.channels).length}** channels.`,
                inline: true
            };
            fields.push(field);
        }
        recv.sendMessage({
            to: channel,
            message: "",
            embed: {
                color: 0x189F06,
                title: `Currently in **${Object.keys(bot.servers).length} servers.**`,
                description: "",
                fields: fields
            }
        });
    }
};