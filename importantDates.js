/**
 * Created by Peter on 07/07/2016.
 */
module.exports = function(bot){
    return{
        init: function checkImportantDates(cb){
            var date = new Date();
            if(bot.config.importantDates[date.getDate()+"/"+date.getMonth()]){
                bot.sendMessage({
                    to: bot.config.misc.mainChannel,
                    message: bot.config.importantDates[date.getDate()+"/"+date.getMonth()]
                });
            }else{
                bot.log("No important dates today.");
            }
            setTimeout(checkImportantDates,  8.64e7); //24 hours
            if(cb)
                cb();
        }
    }
};