/**
 * Created by Peter on 17/07/2016.
 */
import test from 'ava';
var fs = require('fs');


var files = fs.readdirSync("commands");
for (var i in files) {
    if(files.hasOwnProperty(i)){
        if(!fs.lstatSync('./commands/'+files[i]).isDirectory()){
            var newCommand = require('./commands/' + files[i]).command;
            if(newCommand.test)
                newCommand.test(test);
            else
                console.warn("Skipping "+newCommand.name+" as it doesn't have any tests defined.");
        }
    }
}