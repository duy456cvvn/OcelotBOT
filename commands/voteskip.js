var currentSkips = [];
exports.command = {
	name: "voteskip",
	desc: "Vote skip song",
	usage: "voteskip",
	func: function(user, userID, channel, args, message, bot){

		if(currentSkips.indexOf(userID) > -1){
			bot.sendMessage({
	            to: channel,
	            message: "**You've already voteskipped.**"
	        });
		}else{
			if(bot.serverFromChannel(channel) === '144926385834688513'){
				var population = Object.keys(bot.servers['144926385834688513'].channels[bot.nspChannel].members).length-1;

				if(currentSkips.length/population * 100 > 50){
					bot.sendMessage({
			            to: channel,
			            message: "**Vote skip succeeded!**"
			        });

			        bot.getAudioContext({ channel: bot.nspChannel, stereo: true}, function(stream) {
			        	stream.stopAudioFile();
			        });
			        currentSkips = [];
				}else{		
					bot.sendMessage({
			            to: channel,
			            message: "**"+user+" voted to skip "+bot.nowPlaying+".** Needs **"+(100-((currentSkips.length/population) * 100))+"%** more votes to skip. ("+currentSkips.length+" out of "+population+" voted)"
			        });
				}
			}else{

				var population = Object.keys(bot.servers['165964047991177216'].channels['168188506269679616'].members).length-1;

				if(!bot.servers['165964047991177216'].channels['168188506269679616'].members[userID]){
						bot.sendMessage({
				            to: channel,
				            message: "You need to be in the voice channel to vote skip!"
				        });
				}else{
					if(currentSkips.length/population * 100 > 33){
						bot.sendMessage({
				            to: channel,
				            message: "**Vote skip succeeded!**"
				        });

						bot.sendMessage({
				            to: "168190124666912769",
				            message: "!m n"
				        });
				       
				        currentSkips = [];
					}else{		
						currentSkips.push(userID);
						bot.sendMessage({
				            to: channel,
				            message: "**"+user+" voted to skip the current song.** Type !voteskip to vote. ("+currentSkips.length+" out of "+parseInt((population * 0.33)+1)+" voted)"
				        });
				        setTimeout(function(){
			        		currentSkips = [];
				        }, 30000);
					}
				}
			}
			
		}
	
        return true;
	}
};