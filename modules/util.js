/**
 * Created by Peter on 01/07/2017.
 */
module.exports = function(bot){
    return {
        name: "Utilities  Module",
        enabled: true,
        init: function init(cb) {

            bot.util = {};

            /**
             * Chooses a random object from `array`
             * @param {Array} array
             * @returns {*} A random object from the specified array
             */
            bot.util.arrayRand = function arrayRand(array){
                return array[Math.round(Math.random()*array.length)];
            };

            /**
             * Parses a number into a human readable format
             * @param {number} x
             * @returns {string}
             */
            bot.util.numberWithCommas = function numberWithCommas(x){
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };



            bot.util.quantify = function quantify(data, unit, value) {
                if (value) {
                    if (value > 1 || value < -1)
                        unit += 's';

                    data.push(value + ' ' + unit);
                }

                return data;
            };

            /**
             * Parses a number of seconds as a proper time
             * @param {number} seconds
             * @returns {string}
             */
            bot.util.prettySeconds = function prettySeconds(seconds) {

                var prettyString = '',
                    data = [];

                if (typeof seconds === 'number') {

                    data = bot.util.quantify(data, 'day',    parseInt(seconds / 86400));
                    data = bot.util.quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
                    data = bot.util.quantify(data, 'minute', parseInt((seconds % 3600) / 60));
                    data = bot.util.quantify(data, 'second', Math.floor(seconds % 60));

                    var length = data.length,
                        i;

                    for (i = 0; i < length; i++) {

                        if (prettyString.length > 0)
                            if (i == length - 1)
                                prettyString += ' and ';
                            else
                                prettyString += ', ';

                        prettyString += data[i];
                    }
                }

                return prettyString;
            };


            cb();
        }
    }
};