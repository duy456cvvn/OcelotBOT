/**
 * Created by Peter on 05/07/2017.
 */
var messenger = require('messenger');


// a client that can be used to emit to all the servers
var client = messenger.createSpeaker(8001, 8002, 8003, 8004);

setInterval(function(){
    // use send instead of reply
    console.log("Sending...");
    client.send('a message came', {some: 'data'});
}, 2000);