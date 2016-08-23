var r = require('rethinkdb');
var waitingOn = null;
exports.command = {
    name: "fixasong",
    desc: "A test command",
    usage: "test [buttons/base64]",
    onReady: function (bot) {
        bot.registerInteractiveMessage("fixsong", function (name, val, info) {
            waitingOn = {name: name, id: val};
            if(name === "title")
                bot.web.chat.update(info.original_message.ts, info.channel.id, "*Enter the new title !fixasong <newtitle>*\n");

            if(name === "artist")
                bot.web.chat.update(info.original_message.ts, info.channel.id, "*Enter the new artist !fixasong <newartist>*\n");

            if(name === "path")
                bot.web.chat.update(info.original_message.ts, info.channel.id, "*Enter the new path (i.e /home/peter/nsp/song.mp3) !fixasong <path>*\n");
            if(name === "albumart")
                bot.web.chat.update(info.original_message.ts, info.channel.id, "*Enter the new album art URL !fixasong <albumart>*\n");
            if(name === "clear") {
                r.db("petermon").table("music").get(val).update({reports: []}).run(bot.rconnection, function(err){
                    if(err){
                        bot.web.chat.update(info.original_message.ts, info.channel.id, "Error: "+err)
                    }else{
                        bot.web.chat.update(info.original_message.ts, info.channel.id, "Reports cleared");
                    }
                });
                waitingOn = null;
            }

            return "";
        });

    },
    func: function (user, userID, channel, args, message, bot) {
        if(waitingOn){
            if(args.length < 2){
                bot.sendMessage({
                	to: channel,
                	message: "!fixasong <new"+waitingOn.name+">"
                });
            }else{
                var sentence = message.substring(message.indexOf(args[1]));
                var query;
                switch(waitingOn.name){
                    case "path":
                    case "artist":
                    case "title":
                        var update = {};
                        update[waitingOn.name] = sentence;
                        query =  r.db("petermon").table("music").get(waitingOn.id).update(update);
                        break;
                    case "albumart":
                        query = r.db("petermon").table("music").get(waitingOn.id).update({albumArt: r.http(args[2].replace("<", "").replace(">", ""))}, {nonAtomic: true});
                        break;
                }
               query.run(bot.rconnection, function(err){
                  if(err){
                      bot.sendMessage({
                      	to: channel,
                      	message: "Error: "+err
                      });
                  }else{
                      bot.sendMessage({
                      	to: channel,
                      	message: "Success!"
                      });
                  }
                   waitingOn = null;
               });
            }
            return true;
        }
        r.db("petermon").table("music").filter(function (song) {
            return song("reports").count().ne(0);
        }).pluck("artist", "id", "path", "reports", "title", "duration").orderBy(r.desc(r.row("reports").count())).limit(1).run(bot.rconnection, function(err, cursor){
            if(err){
                bot.sendMessage({
                    to: channel,
                    message: err
                });
            }else{
                var song = cursor[0];
                bot.sendAttachment(channel, "\n", [{
                    fallback: `A song`,
                    color: "#45a569",
                    author_name: "Reported song",
                    author_icon: "http://files.unacceptableuse.com/petify.png",
                    author_link: `https://unacceptableuse.com/petermon/music/${song.id}`,
                    thumb_url: `https://unacceptableuse.com/petermon/music/albumart/${song.id}`,
                    fields: [
                        {
                            title: "Title",
                            value: song.title,
                            short: false
                        },
                        {
                            title: "Artist",
                            value: song.artist,
                            short: false
                        },
                        {
                            title: "Path",
                            value: song.path,
                            short: false
                        },
                        {
                            title: "Reports",
                            value: song.reports.join("\n"),
                            short: true
                        }
                    ],
                    "callback_id": "fixsong",
                    actions: [
                        {
                            text: "Fix Title",
                            name: "title",
                            value: song.id,
                            type: "button"
                        },
                        {
                            text: "Fix Artist",
                            name: "artist",
                            value: song.id,
                            type: "button"
                        },
                        {
                            text: "Fix Album Art",
                            name: "albumart",
                            value: song.id,
                            type: "button"
                        },
                        {
                            text: "Fix Path",
                            name: "path",
                            value: song.id,
                            type: "button"
                        },
                        {
                            text: "Clear reports",
                            name: "clear",
                            value: song.id,
                            type: "button"
                        }
                    ]
                }]);
            }
        });
        return true;
    }
};

