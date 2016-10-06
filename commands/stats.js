/**
 * Created by Peter on 07/07/2016.
 */
var r = require('rethinkdb');
var commonWords = [
    "was", "is", "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","person","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us", "it's", "don't", "dont"
];
exports.command = {
    name: "stats",
    desc: "Stats n shit",
    usage: "stats <user>",
    func: function(user, userID, channel, args, message, bot){

        var target;
        if(args.length < 2){
            return false;
            //bot.web.users.info(target, function(err, user){
            //    if(err){
            //        bot.sendMessage({
            //            to: channel,
            //            message: "Error getting user information:\n "+err
            //        });
            //    }else{
            //        target = user.user.name;
            //    }
            //});
        }else{
            target = args[1];
        }

        target = target.toLowerCase();
        var messageID;
        bot.sendMessage({
            to: channel,
            message: "Gathering stats (This might take a while)..."
        }, function(err, resp){
            if(!err)
                messageID = resp.ts
        });

        var output = "*Overview for "+target+"*:\n";
        r.db('ocelotbot').table('messages').filter({user: target}).run(bot.rconnection, function(err, cursor){
           if(err){
               output+= "Error getting messages: "+err;
           }else{
               cursor.toArray(function(err, array){

                   if(err){
                       output+= "Error converting cursor to array: "+err
                   }else{
                       var totalWords = 0;
                       var totalChars = 0;
                       var uniqueWords = {};
                       var channels = {};
                       for(var i in array){
                           if(array.hasOwnProperty(i)){
                               var entry = array[i];
                               var message = entry.message;
                               var channel_ = entry.channel;
                               var words = message.split(" ");
                               totalWords += words.length;
                               totalChars += message.length;

                               for(var j in words){
                                   if(words.hasOwnProperty(j)){
                                       words[j] = words[j].toLowerCase().trim();
                                       if(words[j].length < 3  || commonWords.indexOf(words[j]) > -1)continue;
                                       if(uniqueWords[words[j]]){
                                           uniqueWords[words[j]]++;
                                       }else{
                                           uniqueWords[words[j]] = 1;
                                       }
                                   }
                               }

                               if(channels[channel_]){
                                   channels[channel_]++
                               }else{
                                   channels[channel_] = 1;
                               }

                           }
                       }

                       var uniqueWordsSorted = Object.keys(uniqueWords).sort(function(a,b){return uniqueWords[a]-uniqueWords[b]});
                       var channelsSorted = Object.keys(channels).sort(function(a,b){return channels[a]-channels[b]});



                       output+= "- *"+array.length+"* total messages.\n";
                       output+= "- *"+totalWords+"* total words (*"+Object.keys(uniqueWords).length+"* unique).\n";
                       output+= "- *"+parseInt(totalWords/array.length)+"* words per message.\n";
                       output+= "- *"+totalChars+"* total characters.\n";
                       output+= "- At 44 words per minute (average), this would've taken *"+parseInt((totalWords/44)/60)+"* hours to type.\n";
                       output+= "- At 101 words per minute (peter speed), this would've taken *"+parseInt((totalWords/101)/60)+"* hours to type.\n";
                       output+= "- The most used word is *"+uniqueWordsSorted[uniqueWordsSorted.length-1]+"* with *"+uniqueWords[uniqueWordsSorted[uniqueWordsSorted.length-1]]+"* uses.\n";
                       output+= "- Their favourite channel is *"+channelsSorted[channelsSorted.length-1]+"* with *"+channels[channelsSorted[channelsSorted.length-1]]+"* messages.\n";


                   }


                   bot.editMessage({
                       channel: channel,
                       messageID: messageID,
                       message: output
                   });
               });
           }


        });



        return true;
    }
};

