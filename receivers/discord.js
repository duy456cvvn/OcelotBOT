
const   config = require('config'),
        Discord = require('discord.io');
module.exports = {
    name: "Discord Message Receiver",
    init: function init(bot, cb) {
        bot.discordClient = new Discord({

        })
    },
    sendMessage: function(opts, cb){
        bot.discordClient.sendMessage(opts, cb);

    }
};