
const   config = require('config'),
        Discord = require('discord.io'),
        request = require('request');
/** @namespace bot.receivers.discord */
/**
 * @param {bot} bot
 * @returns {object}
 */
module.exports = function(bot){
    var obj =  {
        name: "Discord Message Receiver",
        id: "discord",
        init: function init(namespace, cb) {

            var discordConfig = {
                token: config.get("Discord.token"),
                autorun: false
            };

            if(config.get("Discord.totalShards") > 0){
                discordConfig.shard = [config.get("Discord.shard"), config.get("Discord.totalShards")];
                bot.log(`This is shard #${discordConfig.shard[0]}`);
            }

            bot.message = null;

            namespace.client = new Discord.Client(discordConfig);

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

            var lastPresenceUpdate = 0;

            namespace.client.on("guildCreate", function guildCreate(server) {
                bot.log("Joined Server " + server.name);

                var now = new Date();
                if(now-lastPresenceUpdate > 10000){
                    bot.log("!!! Updating presence");
                    namespace.client.setPresence({
                        game: {
                            name: `${bot.message ? bot.message + " | " : ""}in ${Object.keys(namespace.client.servers).length} servers.`
                        }
                    });
                    lastPresenceUpdate = now;

                    if(config.get("Broker.debug") == false) {
                        request.post({
                            headers: {
                                "Authorization": config.get("Discord.discordBotsKey"),
                                "Content-Type": "application/json"
                            },
                            url: "https://bots.discord.pw/api/bots/146293573422284800/stats",
                            body: `\{"server_count": ${Object.keys(namespace.client.servers).length}}`
                        }, function (err, resp, body) {
                            console.log(body);
                        });
                        request.post({
                            headers: {
                                "Authorization": config.get("Discord.discordBotsOrgKey"),
                                "Content-Type": "application/json"
                            },
                            url: "https://discordbots.org/api/bots/146293573422284800/stats",
                            body: `\{"server_count": ${Object.keys(namespace.client.servers).length}}`
                        }, function (err, resp, body) {
                            console.log(body);
                        });
                    }

                }

            });

            namespace.client.on("message", function (user, userID, channelID, message, event) {
                if(userID != namespace.client.id)
                    bot.receiveMessage(user, userID, channelID, message, event);
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
                obj.totalMessageTime += new Date() - messageParams.sentAt;
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
         * @param cb {function} callback
         * @returns {string}
         */
        getServerFromChannel: function getServerFromChannel(channel, cb){
            cb(null, bot.receivers.discord.internal.client.channels[channel] ? bot.receivers.discord.internal.client.channels[channel].guild_id : "DM");
        },
        getServerInfo: function(server, cb){
            cb(null, bot.receivers.discord.internal.client.servers[server]);
        },
        getChannelInfo: function(channel, cb){
            cb(null, bot.receivers.discord.internal.client.channels[channel]);
        },
        /**
         * Gets user details from their Snowflake
         * @param {string} id
         * @param cb
         */
        getUser: function getUser(id, cb){
            cb(null, bot.receivers.discord.internal.client.users[id]);
        },
        simulateTyping: function simulateTyping(channel, cb){
            bot.receivers.discord.internal.client.simulateTyping(channel, cb);
        },
        uploadFile: function uploadFile(opts, cb){
            if(opts.file.type && opts.file.type === "Buffer")
                opts.file = new Buffer(opts.file.data);
            bot.receivers.discord.internal.client.uploadFile(opts, cb);
        },
        sendAttachment: function sendAttachment(channel, text, attachments, cb){
            var attachment = attachments[0];
            for(var i in attachment.fields){
                attachment.fields[i].name = attachment.fields[i].title;
                delete attachment.fields[i].title;
                attachment.fields[i].inline = attachment.fields[i].short;
                delete attachment.fields[i].short;
            }
            obj.sendMessage({
                to: channel,
                message: text,
                embed: {
                    color: parseInt("0x"+attachment.color.substring(1)),
                    title: attachment.title,
                    description: attachment.text,
                    image: {
                        url: attachment.author_icon
                    },
                    fields: attachment.fields,
                    author: {
                        name: attachment.author_name,
                        url: attachment.author_link,
                        icon_url: attachment.author_icon
                    }
                }
            }, cb);
        },
        editMessage: function editMessage(opts, cb){
            bot.receivers.discord.internal.client.editMessage(opts, cb);
        },
        addReaction: function addReaction(opts, cb){
            try {
                bot.receivers.discord.internal.client.addReaction(opts, cb);
            }catch(e){
                console.error(e);
                cb(e);
            }
        },
        getReaction: function getReaction(opts, cb){
            bot.receivers.discord.internal.client.getReaction(opts, cb);
        },
        getMessages: function getMessages(opts, cb){
            bot.receivers.discord.internal.client.getMessages(opts, cb);
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
            bot.receivers.discord.internal.client[func].apply(args);
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
            bot.log(`Setting message to ${text}`);
            bot.message = text === "clear" ? null : text;
            bot.receivers.discord.internal.client.setPresence({
                game: {
                    name: `${bot.message ? bot.message + " | " : ""}in ${Object.keys(bot.receivers.discord.internal.client.servers).length} servers.`
                }
            });
        },
        getServers: function getServers(cb){
            cb(null, bot.receivers.discord.internal.client.servers)
        },
        getUsers: function getUsers(cb){
            cb(null, bot.receivers.discord.internal.client.users)
        },
        getChannels: function getChannels(cb){
            cb(null, bot.receivers.discord.internal.client.channels)
        },
        getInstances: function getInstances(cb){
            cb(null, bot.availableInstances);
        },
        getBusyInstances: function getBusyInstances(cb){
            cb(null, bot.busyInstances);
        },
        leaveServer: function leaveServer(server, cb){
            bot.receivers.discord.internal.client.leaveServer(server, cb)
        },
        createInvite: function createInvite(opts, cb){
            bot.receivers.discord.internal.client.createInvite(opts, cb);
        }
    };

    return obj;
};