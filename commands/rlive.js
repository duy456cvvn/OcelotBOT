var WebSocketClient = require('websocket').client;
var http = require('http');
var https = require('https');
var client;
var title = "";
exports.command = {
	name: "rlive",
	desc: "Subscribe to reddit live threads",
	usage: "rlive <subscribe <url>/ unsubscribe>",
	func: function(user, userID, channel, args, message, bot){
		if(args.length < 2)return false;
		if(args[1] === "subscribe"){
			if(args.length < 3)return false;
			if(client){
				bot.sendMessage({
		            to: channel,
		            message: "You must unsubscribe from `"+title+"` first"
		        });
			}else{
				if(args[2].indexOf("reddit.com/live") > -1){
					args[2] = args[2].replace("<","").replace(">","");
					var url = args[2]+"/about/.json";
					bot.sendMessage({
						to: channel,
						message: url
					});
					var proto = args[2].startsWith("https") ? https : http;
					proto.get(url, function(response){
						var body = "";
				        response.on('data', function (chunk) {
				            body += chunk;
				        });
				        response.on('end', function rliveInfoResponseEnd() {
				          	var jsonResp = JSON.parse(body);
				          	if(jsonResp.error){
				          		bot.sendMessage({
						            to: channel,
						            message: "Invalid live thread. ("+rjsonResp.error+")"
						        });
				          	}else{
				          		title = jsonResp.data.title;
					          	var websocketUrl = jsonResp.data.websocket_url;
					          	ws = new WebSocketClient( );
					          	bot.log("Connecting to "+websocketUrl+".");

					          	ws.on('connect', function rliveWebsocketConnect(connection){
				          			bot.log("Connected to websocket.");
					          		bot.sendMessage({
							            to: channel,
							            message: "Connected!"
							        });

							        connection.on('message', function(message){
							        	var data = message.utf8Data;
							        	//if(data.type !== "activity"){
										if(data.payload){
											bot.sendMessage({
												to: channel,
												message: "**"+data.payload.data.author+" posted in `"+title+"`:** \n"+data.payload.data.body
											});
										}

							        	//}
							        });
					          	});

					          	ws.on('connectFailed', function(err){
				          			bot.sendMessage({
							            to: channel,
							            message: "Connection failed: "+err
							        });
					          	});

						        ws.on('httpResponse', function(response, client){
	        		          		bot.sendMessage({
							            to: channel,
							            message: response
							        });
						        });

						        ws.connect(websocketUrl, null);
				          	}
				      	});
					});
				}else{
					bot.sendMessage({
			            to: channel,
			            message: "Not a reddit live URL"
			        });
				}
			}
		}else if(args[1] === "unsubscribe"){
			if(ws){
				ws = null;
				bot.sendMessage({
		            to: channel,
		            message: "Unsubscribed."
		        });
			}else{
				bot.sendMessage({
		            to: channel,
		            message: "Not subscribed to anything!"
		        });
			}
		}else{
			return false;
		}
		
        return true;
	}
};