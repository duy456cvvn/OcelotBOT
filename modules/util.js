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
                return array[Math.round(Math.random()*(array.length-1))];
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
                if (value && value >= 1) {
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

                    data = bot.util.quantify(data, 'year',   Math.round(seconds / 31556926));
                    data = bot.util.quantify(data, 'day',    parseInt((seconds % 31556926) / 86400));
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

            bot.util.debounce = function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this
                        , args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate)
                            func.apply(context, args)
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow)
                        func.apply(context, args)
                }
            };

            bot.util.throttle = function throttle(fn, threshhold, scope) {
                threshhold || (threshhold = 250);
                var last, deferTimer;
                return function() {
                    var context = scope || this;
                    var now = +new Date
                        , args = arguments;
                    if (last && now < last + threshhold) {
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(function() {
                            last = now;
                            fn.apply(context, args)
                        }, threshhold)
                    } else {
                        last = now;
                        fn.apply(context, args)
                    }
                }
            };

            bot.util.searchCache = function (moduleName, callback) {
                // Resolve the module identified by the specified name
                var mod = require.resolve(moduleName);

                // Check if the module has been resolved and found within
                // the cache
                if (mod && ((mod = require.cache[mod]) !== undefined)) {
                    // Recursively go over the results
                    (function run(mod) {
                        // Go over each of the module's children and
                        // run over it
                        mod.children.forEach(function (child) {
                            run(child);
                        });

                        // Call the specified callback providing the
                        // found module
                        callback(mod);
                    })(mod);
                }
            };

            bot.util.uncache = function uncache(moduleName, cb) {
                // Run over the cache looking for the files
                // loaded by the specified module name
                bot.util.searchCache(moduleName, function (mod) {
                    delete require.cache[mod.id];
                    if(cb)
                        cb();
                });

                // Remove cached paths to the module.
                // Thanks to @bentael for pointing this out.
                Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
                    if (cacheKey.indexOf(moduleName)>0) {
                        delete module.constructor._pathCache[cacheKey];
                    }
                });
            };


            cb();
        }
    }
};