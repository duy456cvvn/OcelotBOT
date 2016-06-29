/**
 * Created by Peter on 27/06/2016.
 */
var https = require('https');
var pizzaStatuses=  {
    5: "Baking",
    9: "Out for delivery",
    3: "Delivered"
};

exports.command = {
        name: "pizzatrack",
        desc: "Track pizza",
        usage: "<id>",
        func: function(user, userID, channel, args, message, bot){
            https.get("https://www.dominos.co.uk/pizzaTracker/getOrderDetails?id=MTU2MTI4Mjg2fDZmMmZkM2M3LWY1NzItNGY0Yi05N2Y2LTI5ZDA1NzY3YjhiYw%3D%3D&noCache=1467061183166", function(response){
                var body = "";
                response.on('data', function (chunk) {
                    body += chunk;
                });

                response.on('end', function () {
                    var data = JSON.parse(body);
                    bot.sendMessage({
                        to: channel,
                        message: `Pizza is *${pizzaStatuses[data.statusId] ? pizzaStatuses[data.statusId] : data.statusId}*, for ${data.customerName} in ${data.storeName}, made by ${data.storeManagerName} and delivered by ${data.driverName}`
                    });

                });
            });
            return true;
        }
    };

