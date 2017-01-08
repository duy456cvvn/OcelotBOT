exports.command = {
    name: "poem",
    desc: "Get an urban dictionary definition",
    usage: "defineud <word>",
    func: function(user, userID, channel, args, message, bot){
        var messageID = 0;
        bot.sendMessage({
            to: channel,
            message: "Generating Poem (This will take forever)"
        }, function(err, resp){
            if(!err) {
                messageID = resp.ts;
                bot.connection.query('SELECT message, user, time FROM Messages WHERE message REGEXP ".*([to]o|u|[uei]w|2)$" AND (LENGTH(message) - LENGTH(REPLACE(message, " ", ""))) > 5 ORDER BY RAND() LIMIT 1', function(err, result) {
                    if(err) {
                        bot.editMessage({
                            channel: channel,
                            messageID: messageID,
                            message: `Error: ${err}`
                        });
                    } else {
                        if(result.length > 0) {
                            var row = result[0],
                                message = [
                                    'Roses are red',
                                    'Violets are blue',
                                    `>${row.message}`,
                                    `-${row.user} ${new Date(row.time).getFullYear()}`
                                ];

                            bot.editMessage({
                                channel: channel,
                                messageID: messageID,
                                message: message.join('\n')
                            });
                        }
                    }
                });
            }
        });

        return true;
    }
};
