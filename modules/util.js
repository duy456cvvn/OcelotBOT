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
            bot.util.numberWithCommas = function(x){
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };

            cb();
        }
    }
};