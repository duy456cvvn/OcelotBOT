const request = require('request');
const config = require('config');
const fs = require('fs');


const key = config.get('Lang.key');



request.post({
	url: "https://api.poeditor.com/v2/languages/list",
	form: {
		api_token: key,
		id: 124405
	},
	json: true
}, function (err, resp, body) {
	const langs = body.result.languages;
	for(var i = 0; i < langs.length; i++){
		downloadLanguage(langs[i].code, langs[i].name);
	}
});


function downloadLanguage(code, name){
	console.log("Downloading "+code);
	request.post({
		url: "https://api.poeditor.com/v2/terms/list",
		form: {
			api_token: key,
			id: 124405,
			language: code
		},
		json: true
	}, function (err, resp, body) {
		var output = {};
		const terms = body.result.terms;
		output["LANGUAGE_NAME"] = name;
		output["LANGUAGE_FLAG"] = `:flag_${code}:`;
		for(var i = 0; i < terms.length; i++){
			const term = terms[i];
			if(term.translation.content && term.translation.content.length > 0)
				output[term.term] = term.translation.content;
		}
		fs.writeFile(`lang/${code}.json`, JSON.stringify(output), function(err){
			if(err){
				console.error("Error downloading "+code);
				console.log(err);
			}else
				console.log("Downloaded "+code);
		})
	});
}