/**
 * Created by Peter on 02/07/2017.
 */
const ping = require('ping');
const async = require('async');
const hosts = require('config').get("Commands.status.hosts");
module.exports = {
    name: "Service Status",
    usage: "status",
    accessLevel: 0,
    commands: ["status"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        var output = "**Service Status:**\n";

        async.eachSeries(hosts, function(host, cb){
            ping.sys.probe(host.host, function(isAlive){
                output += `${isAlive ? ":white_check_mark:" : ":negative_squared_cross_mark:"} **${host.name}**\n`;
                cb()
            });
        }, function(){
            recv.sendMessage({
                to: channel,
                message: output
            });
        });

    }
};