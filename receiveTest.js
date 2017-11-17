/**
 * Created by Peter on 05/07/2017.
 */
var messenger = require('messenger');

// here we have 4 servers listening on 4 different ports
var server1 = messenger.createListener(8002);
var server2 = messenger.createListener(8001);
var server3 = messenger.createListener(8003);
var server4 = messenger.createListener('127.0.0.1:8004');

server1.on('a message came', function(m, data){
    console.log("server 1");
    console.log(data);
});

server2.on('a message came', function(m, data){
    console.log("server 2");
    console.log(data);
});

server3.on('a message came', function(m, data){
    console.log("server 3");
    console.log(data);
});

server4.on('a message came', function(m, data){
    console.log("server 4");
    console.log(data);
});