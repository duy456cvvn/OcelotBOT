/**
 * Created by Peter on 06/07/2017.
 */
const pm2 = require('pm2');
const async = require('async');


pm2.connect(function(){
    console.log("Connected to pm2");
     pm2.list(function(err, result){
         if(err){
             console.error(`Error listing PM2 processes: ${err}`);
             process.exit(1);
         }else{
             async.eachSeries(result, function(process, cb){
                 if(process.name.startsWith("ocelotbot-")){
                    console.log(`Found process ${process.name}, restarting...`);
                    pm2.restart(process.name, function(err){
                        if(err){
                            console.error(`FAILED to restart ${process.name}: ${err}`);
                        }else{
                            console.log(`Restarted ${process.name}`);
                            setTimeout(cb, 10000);
                        }
                    })
                 }else{
                     cb();
                 }
             }, function(){
                 console.log("Finished deploy.");
                 pm2.disconnect();
                 process.exit(0);
             });
         }
     });
});