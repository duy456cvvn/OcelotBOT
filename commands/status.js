/*
* Copyright Ocelotworks 2016 - I should be doing homework right now
 */
const os = require('os');
var ping = require('ping');
var async = require('async');
exports.command = {
    name: "status",
    desc: "Ocelotworks Service Status",
    usage: "status",
    func: function(user, userID, channel, args, message, bot){

        const hosts = [
            {
                host: "vpn.tekno.pw",
                name: "VPN (!youtube)"
            },
            {
                host: "earth.boywanders.us",
                name: "Earth (Main Server)"
            },
            {
                host: "saturn.boywanders.us",
                name: "Saturn"
            },
            {
                host: "mercury.boywanders.us",
                name: "Mercury"
            },
            {
                host: "homeof.unacceptableuse.com",
                name: "Petermon (!peterstate)"
            },
        ];

        var output = "**Service Status:**\n";

        output += (bot.connection  ? ":white_check_mark:" : ":red_circle:")+" **Database**\n";

        async.eachSeries(hosts, function(host, cb){
            ping.sys.probe(host.host, function(isAlive){
                output += `${isAlive ? ":white_check_mark:" : ":red_circle:"} **${host.name}**\n`;
                cb()
            });
        }, function(){
            bot.sendMessage({
                to: channel,
                message: output
            });
        });

        return true;
    }
};