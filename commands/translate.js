/**
 * Created by Peter on 03/07/2016.
 */
var request = require('request');
exports.command = {
    name: "translate",
    desc: "Translate something",
    usage: "translate <to> <sentence>",
    func: function(user, userID, channel, args, message, bot){

        var sentence = message.substring(message.indexOf(args[2]));

        request("https://translate.yandex.net/api/v1.5/tr.json/detect?key="+bot.config.misc.translateKey+"&text="+sentence, function getTranslationLanguage(err, response, body){
            if(err){
                bot.sendMessage({
                	to: channel,
                	message: "There was an error contacting the translation server."
                });
                bot.error("Error getting translation language: "+err);
            }else{
                var langResult = JSON.parse(body);
                if(langResult.code === 200){
                    request("https://translate.yandex.net/api/v1.5/tr.json/translate?key="+bot.config.misc.translateKey+"&lang="+langResult.lang+"-"+args[1]+"&text="+sentence, function getTranslation(err, response, body){
                        if(err){
                            bot.sendMessage({
                                to: channel,
                                message: "There was an error contacting the translation server."
                            });
                            bot.error("Error translating '"+sentence+"': "+err);
                        }else{
                            var transResult = JSON.parse(body);
                            if(transResult.code === 200){
                                bot.sendMessage({
                                    to: channel,
                                    message: "Translated "+transResult.lang+":\n>"+transResult.text
                                });
                            }else{

                                bot.sendMessage({
                                    to: channel,
                                    message: "Error: "+langResult.message+"\nYou must supply an output language i.e 'en'"
                                });
                            }
                        }
                    });


                }else{
                    bot.sendMessage({
                    	to: channel,
                    	message: "Error guessing language: "+langResult.code+": `"+body+"`"
                    });
                }
            }
        });

        return true;
    },
    test: function(test){
        test.cb.failing('translate french', function(t){
            t.plan(2);
            var bot = {};
            bot.sendMessage = function(data){
                t.is(data.message, "Translated fr-en:\n> I love cheese");
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["translate", "en", "asdadasd"], "!translate en J'adore le fromage", bot));
        });
        test.todo("translate no args");
    }
};