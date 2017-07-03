/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "channelinfo",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        const channelID = recv.getServerFromChannel(args[1]);
        const thisChannel =  recv.getChannelInfo(channelID);
        const thisServer = recv.getServerInfo(channelID);
        if(!channelID){
            recv.sendMessage({
                to: channel,
                message: "This channel does not exist."
            });
        }else if(channelID === "DM"){
            var thisUser = recv.getUser(channelID);
            recv.sendMessage({
                to: channel,
                message: `This is a direct message from ${thisUser.username}`
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: `Channel ${thisChannel.name} belongs to server ${thisServer.name}. It has ${thisServer.member_count} members.`
            });
        }

    }
};