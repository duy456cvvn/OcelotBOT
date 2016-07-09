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
    }
};

