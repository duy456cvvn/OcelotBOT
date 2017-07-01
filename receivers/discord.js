
const   config = require('config'),
        Discord = require('discord.io');
/**
 * @namespace bot.receivers.discord
 * @param {bot} bot
 * @returns {object}
 */
module.exports = function(bot){
    var obj =  {
        name: "Discord Message Receiver",
        id: "discord",
        init: function init(namespace, cb) {
            namespace.client = new Discord.Client({
                token: config.get("Discord.token"),
                autorun: false
            });

            namespace.name = "discord";

            bot.log("Connecting to Discord...");
            namespace.client.connect();

            namespace.client.on('ready', function discordReady() {
                bot.log("Connected to Discord");

            });

            namespace.client.on("disconnect", function disconnect(err) {
                bot.warn("Disconnected from Discord... Reconnecting in 1 second " + err);
                setTimeout(namespace.client.connect, 1000);
            });

            namespace.client.on("guildCreate", function guildCreate(server) {
                bot.log("Joined Server " + server.name);
            });

            namespace.client.on("message", function (user, userID, channelID, message, event) {
                if(userID != namespace.client.id)
                    bot.receiveMessage(user, userID, channelID, message, event, bot, obj.id);
            });

            cb();


        },
        messageQueue: [],
        totalMessageTime: 0,
        messageCount: 0,
        isProcessingMessageQueue: false,
        /**
         * Process the messages currently waiting to be sent.
         */
        processMessageQueue: function processMessageQueue(){
            var messageParams = obj.messageQueue.pop();
            if(messageParams){
                obj.isProcessingMessageQueue = true;
                bot.receivers.discord.internal.client.sendMessage(messageParams[0], messageParams[1]);
                obj.messageCount++;
                obj.totalMessageTime = new Date() - messageParams.sentAt;
                setTimeout(obj.processMessageQueue, parseInt(config.get("Discord.messageDelay")));
            }else{
                obj.isProcessingMessageQueue = false;
            }
        },
        /**
         * Send a message
         * @param {object} opts
         * @param {function} cb
         */
        sendMessage: function sendMessage(opts, cb) {
            opts.sentAt = new Date();
            obj.messageQueue.push([opts, cb]);
            if(!obj.isProcessingMessageQueue)
                obj.processMessageQueue();
        },
        /**
         * Get the server Snowflake that a channel belongs to
         * @param {string} channel
         * @returns {string}
         */
        getServerFromChannel: function getServerFromChannel(channel){
            return bot.receivers.discord.internal.client.channels[channel].guild_id;
        },
        /**
         * Gets user details from their Snowflake
         * @param {string} id
         */
        getUser: function getUser(id){
            return bot.receivers.discord.internal.client.users[id];
        },
        simulateTyping: function simulateTyping(channel, cb){
            bot.receivers.discord.internal.client.simulateTyping(channel, cb);
        },
        uploadFile: function uploadFile(opts, cb){
            bot.receivers.discord.internal.client.uploadFile(opts, cb);
        }
    };

    return obj;
};