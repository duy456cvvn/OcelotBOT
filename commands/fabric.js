/**
 * Created by Peter on 01/07/2016.
 */
var request = require('request');
var jar = request.jar();
jar.setCookie("notification_key", "2FSznoTAaKpC4W4bETExcIlQtq5eTHTaDOSwbG7");
exports.command = {
    name: "fabric",
    desc: "Integration with fabric.io",
    usage: "fabric",
    onBready: function onReady(bot){
        bot.log("Obtaining fabric.io cookie...");
        request.post(
            {
                url: "https://www.fabric.io/api/v2/session",
                jar: jar, //binks
                headers: {
                    "X-CSRF-Token": "bQ4hQY3df1sPpqMgV3Rc1vwkAPdwkfRA/Mc6F3IhSBo="
                },
                form: {
                    email: bot.config.fabric.email,
                    password: bot.config.fabric.password
                }
            },
            function fabricLogin(err, resp, body){
                if(err){
                    bot.log("Error logging into fabric.io: "+err);
                }else{
                    bot.log("Obtained cookie");
                    try {
                        var data = JSON.parse(body);
                        if (data.name){
                            bot.log("Logged in as "+data.name);
                        }else{
                            bot.log(JSON.stringify(data));                        }
                    }catch(e){
                        bot.log("Error logging in to fabric.io: "+e);
                    }
                }

            }
        );

    },
    func: function(user, userID, channel, args, message, bot){


        request.post(
            {
                url: "https://api-dash.fabric.io/graphql",
                jar: jar, //binks kek
                body: '{"query":"query App_view_ProjectRelayQL($id_0:ID!) {node(id:$id_0) {id,__typename,...F1}} fragment F0 on Project {id,externalId} fragment F1 on Project {id,name,platform,iconUrl,identifier,pinned,installedProducts,organization {alias,id},answers {status},...F0}","variables":{"id_0":"UHJvamVjdDo1NzBlMzk3YTRmZjQ0ODIyODYwMDAwOTI="}}'
            }, function(err, resp, body){
                if(err){
                    bot.sendMessage({
                    	to: channel,
                    	message: err
                    });
                }else
                bot.sendMessage({
                    to: channel,
                    message: "```"+body+"```"
                });
            }
        );



        return true;
    }
};

