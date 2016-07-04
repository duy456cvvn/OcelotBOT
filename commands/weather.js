/**
 * Created by Peter on 04/07/2016.
 */
var request = require('request');
exports.command = {
    name: "weather",
    desc: "Weather at location",
    usage: "weather <search>",
    func: function(user, userID, channel, args, message, bot){

        if(args.length < 2)return false;
        var search = message.substring(message.indexOf(args[1]));

        request("http://api.openweathermap.org/data/2.5/weather?q="+search+"&appid="+bot.config.misc.weatherKey+"&units=metric", function getWeather(err, resp, body){
           if(err){
               bot.log("Error getting weather information: "+err);
               bot.sendMessage({
                to: channel,
                message: "Error contacting weather API."
               });
           }else{
               bot.log("Got weather for "+search);
               var data = JSON.parse(body);
               var attachments = [{
                   fallback: `${data.name}: ${data.weather[0].main} - ${data.weather[0].description} ${data.main.temp}C`,
                   color: exports.command.colourFromTemperature(data.main.temp),
                   author_name: data.weather[0].main,
                   author_link: "http://openweathermap.org/find?utf8=%E2%9C%93&q="+search,
                   author_icon: "http://openweathermap.org/img/w/"+data.weather[0].icon+".png",
                   title: data.name,
                   text: data.weather[0].description,
                   fields:[
                       {
                           title: "Temperature",
                           value: data.main.temp+"C",
                           short: true
                       },
                       {
                           title: "High/Low",
                           value: data.main.temp_max+"C/"+data.main.temp_min+"C",
                           short: true
                       },
                       {
                           title: "Winds",
                           value: data.wind.speed+" mph",
                           short: true
                       }
                   ]
               }];

               bot.sendAttachment(channel, "", attachments);
           }


        });
        return true;
    },

    colourFromTemperature: function(temperature){
        if(temperature < 0)return "#ccffff";
        if(temperature < 10)return "#1ab2ff";
        if(temperature < 20)return "#ffb31a";
        if(temperature < 30)return "#ff6600";
        if(temperature < 40)return "#ff3300";
        if(temperature > 40)return "#cc3300";
    }
};

