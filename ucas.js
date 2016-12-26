/**
 * Created by Peter on 17/11/2016.
 */


var request = require('request');
var htmlparser = require('htmlparser');


module.exports = function(bot) {

    function getRequestToken(cb){
        var parser = new htmlparser.Parser(new htmlparser.DefaultHandler(function(err, dom){
            if(err)cb(err);
            else{
                console.log(JSON.stringify(dom));
                var inputElements = htmlparser.DomUtils.getElementsByTagType("input", dom);
                bot.log(JSON.stringify(inputElements));
            }
        }));
        request("https://track.ucas.com", function(err, response, body){
            parser.parseComplete(body);
            console.log(body);
        });
    }


    return {
        name: "UCAS Application monitor",
        init: function (cb) {
            getRequestToken(function(err, token){
                bot.log(err);
                bot.log(token);
            });
            setInterval(function(){

            }, 36000);
            cb();
        }
    };
};


