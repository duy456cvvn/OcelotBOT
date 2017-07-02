/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const config = require('config');
module.exports = {
    name: "Reddit Image Viewer",
    usage: "image <subreddit>",
    accessLevel: 0,
    commands: ["image"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter a subreddit. i.e. !image aww"
            });
        }else{
            const subreddit = args[1].replace("r/", "");
            request({
                url: `https://api.reddit.com/r/${subreddit}`,
                headers: {
                    'User-Agent': config.get("Commands.image.userAgent")
                }
            }, function(err, resp, body){
                if(err){
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Error contacting reddit. Try again later."
                    });
                    bot.error(err.message);
                }else{
                    try {
                        var data = JSON.parse(body);
                        if (data.error) {
                            var message = "";
                            switch (data.error) {
                                case 404:
                                    message = ":warning: Subreddit does not exist or was banned";
                                    break;
                                case 403:
                                    message = ":warning: Subreddit is invite only or quarantined.";
                                    break;
                                default:
                                    message = ":warning: Unknown error (" + data.error + ")";
                                    break;

                            }
                            recv.sendMessage({
                                to: channel,
                                message: message
                            });
                        } else {
                            var data = data.data;
                            if (data.children.length === 0) {
                                recv.sendMessage({
                                    to: channel,
                                    message: ":warning: There doesn't seem to be anything there."
                                });
                            } else {
                                const posts = data.children;
                                var randPost;

                                for (var i = 0; i < 50; i++) {
                                    randPost = posts[parseInt(Math.random() * posts.length)];
                                    if (randPost.data.selftext_html === null &&
                                        (randPost.data.url.indexOf("imgur.com") > -1 ||
                                        randPost.data.url.indexOf("i.redd.it") > -1 ||
                                        randPost.data.url.indexOf(".png") > -1 ||
                                        randPost.data.url.indexOf(".jp") > -1)) {
                                        break;
                                    }
                                }
                                if(i === 50){
                                    recv.sendMessage({
                                        to: channel,
                                        message: ":warning: Couldn't find a post!"
                                    });
                                }else{
                                    recv.sendMessage({
                                        to: channel,
                                        message: randPost.data.url,
                                        embed: {
                                            title: randPost.data.title,
                                            image: {
                                                url: randPost.data.url
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }catch(e){
                        recv.sendMessage({
                            to: channel,
                            message: "Error parsing response from reddit. Try again later."
                        });
                        bot.error(e.stack);
                    }
                }
            });
        }

    }
};