/**
 * Created by Peter on 05/07/2017.
 */

const ipc = require('node-ipc');
const jsonpack = require('jsonpack');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'world';
ipc.config.retry= 1500;
ipc.config.silent = true;
ipc.config.rawBuffer = false;

const pack = false;

ipc.serve(
    function(){
    	if(ipc.config.rawBuffer){
			ipc.server.on('data', function(buffer){
				var now = new Date().getTime();
				var receivedData = pack ? jsonpack.unpack(buffer.toString()) : JSON.parse(buffer.toString());
				var time = now-receivedData.timestamp;
				console.log("Took "+time+"ms to retrieve "+Object.keys(receivedData.payload).length+" objects.")
			});
		}else{
			ipc.server.on('test', function(data){
				var now = new Date().getTime();
				var receivedData = data;
				var time = now-receivedData.timestamp;
				console.log("Took "+time+"ms to retrieve "+Object.keys(receivedData.payload).length+" objects.")
			});
		}

    }
);



ipc.server.start();