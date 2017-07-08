/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "channelinfo",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.getChannelInfo(args[2], function(err, thisChannel){
            recv.getServerInfo(thisChannel.guild_id, function(err, thisServer){
                if(!thisServer){
                    recv.sendMessage({
                        to: channel,
                        message: "This channel does not exist."
                    });
                }else if(thisServer === "DM"){
                    recv.getUser(channelID, function(err, thisUser){
                        recv.sendMessage({
                            to: channel,
                            message: `This is a direct message from ${thisUser.username}`
                        });
                    });

                }else{
                    recv.sendMessage({
                        to: channel,
                        message: `Channel **#${thisChannel.name}** belongs to server **${thisServer.name}**. It has ${thisServer.member_count} members.`
                    });
                }
            });
        });
    }
};