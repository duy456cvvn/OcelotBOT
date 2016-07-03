var request = require('request');
exports.command = {
	name: "define",
	desc: "Define something",
	usage: "define",
    onReady: function(bot){
        bot.registerInteractiveMessage("define", function(name, val, info){
            if(name === "synonyms"){
                request("http://api.pearson.com/v2/dictionaries/ldoce5/entries?synonyms="+val+"&limit=5", function(err, resp, body){
                    if(err){
                        bot.web.chat.update(info.original_message.ts, info.channel.id, "Error: "+err);
                    }else{
                        var data = JSON.parse(body);
                        var output = "*Synonyms of "+val+":*\n";
                        var updatedAttachment = info.original_message.attachments[0];
                        updatedAttachment.actions = [];
                        for(var i in data.results){
                            if(data.results.hasOwnProperty(i)){
                                output+="- "+data.results[i].headword+"\n";
                                updatedAttachment.actions.push({
                                    type: "button",
                                    name: "define",
                                    value: data.results[i].headword,
                                    text: "Define "+data.results[i].headword
                                });
                            }
                        }

                        updatedAttachment.text = output;

                        bot.web.chat.update(info.original_message.ts, info.channel.id, "", {
                            attachments: [updatedAttachment]
                        });
                    }
                });
            }else if(name === "define"){
                request("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword="+val+"&limit=1", function(err, resp, body){
                    if(err){
                        bot.web.chat.update(info.original_message.ts, info.channel.id, "Error: "+err);
                    }else{
                        var data = JSON.parse(body);
                        if(data.status === 200){
                            if(data.count > 0){
                                var result = data.results[0];
                                if(result.senses[0].definition){

                                    var updatedAttachment = info.original_message.attachments[0];
                                    updatedAttachment.actions = [
                                        {
                                            name: "synonyms",
                                            text: "View Synonyms",
                                            type: "button",
                                            value: word
                                        }
                                    ];

                                    if(data.total >= 2){
                                        updatedAttachment.actions.push({
                                            name: "next",
                                            text: "Next",
                                            type: "button",
                                            value: "0_"+word,
                                            style: "primary"
                                        })
                                    }
                                    updatedAttachment.text = `*${result.headword}* _${result.part_of_speech}_:\n>${result.senses[0].definition}`;

                                    bot.web.chat.update(info.original_message.ts, info.channel.id, "", {
                                        attachments: [updatedAttachment]
                                    });

                                }else{
                                    bot.web.chat.update(info.original_message.ts, info.channel.id, "No definitions found. Be more specific?");
                                }
                            }else{
                                bot.web.chat.update(info.original_message.ts, info.channel.id, "No definitions found");
                            }
                        }
                    }
                });
            }else if("next"){
                var data = val.split("_");
                var index = parseInt(data[0]);
                var word = data[1];
                (function redefine(){
                    request("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword="+word+"&limit=1&offset="+index, function(err, resp, body){
                    if(err){
                        bot.web.chat.update(info.original_message.ts, info.channel.id, "Error: "+err);
                    }else{
                        var data = JSON.parse(body);
                        if(data.status === 200){
                            if(data.count > 0){
                                var result = data.results[0];
                                if(result.senses[0].definition){
                                    var updatedAttachment = info.original_message.attachments[0];
                                    updatedAttachment.actions = [
                                    ];

                                    if(index > 0){
                                        updatedAttachment.actions.push({
                                            name: "next",
                                            text: "Previous",
                                            type: "button",
                                            value: (index+1)+"_"+word,
                                            style: "danger"
                                        })
                                    }

                                    updatedAttachment.actions.push({
                                        name: "synonyms",
                                        text: "View Synonyms",
                                        type: "button",
                                        value: word
                                    });

                                    if(data.total >= 2){
                                        updatedAttachment.actions.push({
                                            name: "next",
                                            text: "Next",
                                            type: "button",
                                            value: (index-1)+"_"+word,
                                            style: "primary"
                                        })
                                    }
                                    updatedAttachment.text = `*${result.headword}* _${result.part_of_speech}_:\n>${result.senses[0].definition}`;

                                    bot.web.chat.update(info.original_message.ts, info.channel.id, "", {
                                        attachments: [updatedAttachment]
                                    });

                                }else{
                                    index++;
                                    redefine();
                                }
                            }else{
                                bot.web.chat.update(info.original_message.ts, info.channel.id, "No definitions found");
                            }
                        }
                    }
                });
                })();
            }
            return "";
        });
    },
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;

		var word = message.substring(message.indexOf(args[1]));

        request("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword="+word+"&limit=1", function(err, resp, body){
            if(err){
                bot.sendMessage({
                	to: channel,
                	message: "Error: "+err
                });
            }else{
                var data = JSON.parse(body);
                if(data.status === 200){
                    if(data.count > 0){
                        var result = data.results[0];
                        if(result.senses[0].definition){
                            var attachments = [
                                {
                                    name: "synonyms",
                                    text: "View Synonyms",
                                    type: "button",
                                    value: word
                                }
                            ];

                            if(data.total >= 2){
                                attachments.push({
                                    name: "next",
                                    text: "Next",
                                    type: "button",
                                    value: "1_"+word,
                                    style: "primary"
                                });
                            }


                            bot.sendButtons(channel,`*${result.headword}* _${result.part_of_speech}_:\n>${result.senses[0].definition}`, `*${result.headword}* _${result.part_of_speech}_:\n>${result.senses[0].definition}`, "define", "#1e1e1e", attachments);
                        }else{
                            bot.sendMessage({
                            	to: channel,
                            	message: "No definition, be more specific perhaps."
                            });
                        }
                    }else{
                        bot.sendMessage({
                        	to: channel,
                        	message: "No definitions found"
                        });
                    }
                }
            }
        });
		
        return true;
	}
};