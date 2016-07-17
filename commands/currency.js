/**
 * Created by Peter on 26/06/2016.
 */
var https = require('https');
exports.command = {
    name: "currency",
    desc: "Convert a currency",
    usage: "currency <currency> <currency>",
    func: function(user, userID, channel, args, message, bot){

        if(args.length < 3)return false;

        https.get("https://api.fixer.io/latest?symbols="+args[2].toUpperCase()+"&base="+args[1].toUpperCase(), function(response){
            var body = "";
            response.on('data', function (chunk) {
                body += chunk;
            });

            response.on('end', function () {
                var data = JSON.parse(body);
                bot.sendMessage({
                    to: channel,
                    message: `1 ${data.base} = ${data.rates[args[2].toUpperCase()]} ${args[2].toUpperCase()}`
                });

            });
        });
      return true;
    },
    test: function(test){
        test.cb('Currency ideal usage test', function(t){
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("USD") > -1 && data.message.indexOf("GBP") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["currency", "GBP", "USD"], "", bot));
        });

        test.cb('Currency lowercase test', function(t){
            t.plan(2);
            var bot = {};
            bot.sendMessage = function(data){
                t.true(data.message.indexOf("USD") > -1 && data.message.indexOf("GBP") > -1);
                t.end();
            };

            t.true(exports.command.func(null, null, "", ["currency", "gbp", "usd"], "", bot));
        });
    }
};

