/**
 * Created by Peter on 27/06/2016.
 */
var https = require('https');
var request = require('request');
var pizzaStatuses=  {
    3: "Delivered",
    5: "Baking",
    9: "Out for delivery",
    10: "Ready to Collect"
};

exports.command = {
        name: "pizzatrack",
        desc: "Track pizza",
        usage: "<id>",
        func: function(user, userID, channel, args, message, bot){
            bot.log(args[1]);
            request("https://www.dominos.co.uk/pizzaTracker/getOrderDetails?id=MTYxMTkyNDk4fDc0ZmJlYzk2LWQ4NTctNGZiOS04NzM4LTA4ZjJkYTk4OWZjZQ==", function(err, response, body){
                bot.sendMessage({
                    to: channel,
                    message: "Error: "+err
                });
                bot.sendMessage({
                    to: channel,
                    message: ": "+response
                });
                bot.sendMessage({
                    to: channel,
                    message: ": "+body
                });
            });

            return true;
        }
    };

