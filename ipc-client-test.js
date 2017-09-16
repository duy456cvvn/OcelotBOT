/**
 * Created by Peter on 05/07/2017.
 */

const ipc = require('node-ipc');
const jsonpack = require('jsonpack');
const crypto = require('crypto');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'hello';
ipc.config.retry = 1000;
ipc.config.silent = true;
ipc.config.rawBuffer = false;

const pack = false;

ipc.connectTo('world', function(){
        ipc.of.world.on('connect', function(){
                ipc.log('## connected to world ##', ipc.config.delay);

				setInterval(function(){
					var payload = require('./ipctest.json');

					if(ipc.config.rawBuffer){
						const obj = {
							timestamp: new Date().getTime(),
							payload: payload
						};
						ipc.of.world.emit(pack ? jsonpack.pack(obj) : new Buffer(JSON.stringify(obj)));

					}else{
						ipc.of.world.emit("test", {
							timestamp: new Date().getTime(),
							payload: payload
						});
					}

				}, 1000);

            });
        ipc.of.world.on('disconnect', function(){
            ipc.log('disconnected from world');
        });
        ipc.of.world.on('app.message', function(data){
            ipc.log('got a message from world : ', data);
        });
    }
);