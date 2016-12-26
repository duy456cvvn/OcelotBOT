/*
* Copyright 2016 UnacceptableUse
 */

var scripts = [2762];
var lastPurchaseCount = 45;
var lastReviewTs = 0;
var request = require('request');

module.exports = function(bot) {
    return {
        name: "ScriptFodder notifcation monitor",
        init: function (cb) {
            cb();
            setInterval(function(){
                var now = 0;
                var attachments = [];
                for(var id in scripts){
                    request({
                        url: "https://scriptfodder.com/api/scripts/purchases/"+scripts[id]+"?api_key="+bot.config.scriptFodderChecker.apiKey,
                        headers: {
                            "User-Agent": "OcelotBOT ScriptFodder service (unacceptableuse.com)"
                        }
                    }, function sfReviewCheck(err, reponse, body){
                        if(err){
                           bot.log("Error checking SF Reviews for script "+scripts[id]+": "+err);
                        }else{
                            try {
                                var data = JSON.parse(body);
                                if (data && data.status === "success") {
                                    if(data.purchases.length > lastPurchaseCount){
                                        bot.sendMessage({
                                            to: bot.config.misc.mainChannel,
                                            message: data.purchases[0].user_name+" has purchased script #"+scripts[id]
                                        });
                                        lastPurchaseCount = data.purchases.length
                                    }
                                    // if (data.reviews.length > lastReviewCount) {
                                    //     lastReviewCount = data.reviews.length;
                                    //     bot.log(JSON.stringify(data.reviews));
                                    //     for (var reviewID in data.reviews) {
                                    //         if (data.reviews.hasOwnProperty(reviewID)) {
                                    //             var review = data.reviews[reviewID];
                                    //             if (now - review.review_time < 1e10) {
                                    //                 var attachment = {
                                    //                     fallback: `${review.user_name} posted a review}`,
                                    //                     color: "#36a64f",
                                    //                     author_name: review.user_name,
                                    //                     author_link: `https://scriptfodder.com/users/view/${review.user_id}}`,
                                    //                     author_icon: "http://" + review.user_avatar,
                                    //                     title: getStars(review.review_rating),
                                    //                     title_link: `https://scriptfodder.com/scripts/view/${scripts[id]}}`,
                                    //                     text: review.review_text
                                    //                 };
                                    //                 attachments.push(attachment);
                                    //             }
                                    //         }
                                    //     }
                                    // }
                                }
                            }catch(e){
                                bot.log(e);
                               // bot.log(body);
                            }
                        }
                    });
                }
                // if(attachments.length > 0)
                //     bot.sendAttachment(bot.config.misc.mainChannel, "You have "+attachments.length+" new reviews.", attachments)
            }, 36000);
        }
    };
};

function getStars(amount){
    var str = "";
    for(var i = 1; i < 5; i++){
        str += amount > i ? "\u2605" : "\u2606";
    }
    return str;
}