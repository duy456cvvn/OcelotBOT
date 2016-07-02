/**
 * Created by Peter on 2/7/216.
 */
var timezones = {
    "ACDT":10.5,
    "ACST":9.5,
    "ACT":-5,
    "ADT":-3,
    "AEDT":11,
    "AEST":10,
    "AFT":4.5,
    "AKDT":-8,
    "AKST":-9,
    "AMST":-3,
    "AMT":-4,
    "ART":-3,
    "AST":3,
    "AWDT":9,
    "AWST":8,
    "AZOST":-1,
    "AZT":4,
    "BDT":8,
    "BIOT":6,
    "BIT":-12,
    "BOT":-4,
    "BRST":-2,
    "BRT":-3,
    "BST":1,
    "BTT":6,
    "CAT":2,
    "CCT":6.5,
    "CDT":-5,
    "CEDT":2,
    "CEST":2,
    "CET":1,
    "CHADT":13.75,
    "CHAST":12.75,
    "CHOT":8,
    "ChST":10,
    "CHUT":10,
    "CIST":-8,
    "CIT":8,
    "CKT":-10,
    "CLST":-3,
    "CLT":-4,
    "COST":-4,
    "COT":-5,
    "CST":-6,
    "CT":8,
    "CVT":-1,
    "CWST":8.75,
    "CXT":7,
    "DAVT":7,
    "DDUT":10,
    "DFT":1,
    "EASST":-5,
    "EAST":-6,
    "EAT":3,
    "ECT":-4,
    "EDT":-4,
    "EEDT":3,
    "EEST":3,
    "EET":2,
    "EGST":0,
    "EGT":-1,
    "EIT":9,
    "EST":-5,
    "FET":3,
    "FJT":12,
    "FKST":-3,
    "FKT":-4,
    "FNT":-2,
    "GALT":-6,
    "GAMT":-9,
    "GET":4,
    "GFT":-3,
    "GILT":12,
    "GIT":-9,
    "GMT": 0,
    "GST":-2,
    "GYT":-4,
    "HADT":-9,
    "HAEC":2,
    "HAST":-10,
    "HKT":8,
    "HMT":5,
    "HOVT":7,
    "HST":-10,
    "IBST": 0,
    "ICT":7,
    "IDT":3,
    "IOT":3,
    "IRDT":4.5,
    "IRKT":8,
    "IRST":3.5,
    "IST":5.5,
    "JST":9,
    "KGT":6,
    "KOST":11,
    "KRAT":7,
    "KST":9,
    "LHST":10.5,
    "LINT":14,
    "MAGT":12,
    "MART":-9.5,
    "MAWT":5,
    "MDT":-6,
    "MET":1,
    "MEST":2,
    "MHT":12,
    "MIST":11,
    "MIT":-9.5,
    "MMT":6.5,
    "MSK":3,
    "MST":8,
    "MUT":4,
    "MVT":5,
    "MYT":8,
    "NCT":11,
    "NDT":-2.5,
    "NFT":11,
    "NPT":5.75,
    "NST":-3.5,
    "NT":-3.5,
    "NUT":-11,
    "NZDT":13,
    "NZST":12,
    "OMST":6,
    "ORAT":5,
    "PDT":-7,
    "PET":-5,
    "PETT":12,
    "PGT":10,
    "PHOT":13,
    "PKT":5,
    "PMDT":-2,
    "PMST":-3,
    "PONT":11,
    "PST":-8,
    "PYST":-3,
    "PYT":-4,
    "RET":4,
    "ROTT":-3,
    "SAKT":11,
    "SAMT":4,
    "SAST":2,
    "SBT":11,
    "SCT":4,
    "SGT":8,
    "SLST":5.5,
    "SRET":11,
    "SRT":-3,
    "SST":-11,
    "SYOT":3,
    "TAHT":-10,
    "THA":7,
    "TFT":5,
    "TJT":5,
    "TKT":13,
    "TLT":9,
    "TMT":5,
    "TOT":13,
    "TVT":12,
    "UCT": 0,
    "ULAT":8,
    "USZ1":2,
    "UTC": 0,
    "UYST":-2,
    "UYT":-3,
    "UZT":5,
    "VET":-4,
    "VLAT":10,
    "VOLT":4,
    "VOST":6,
    "VUT":11,
    "WAKT":12,
    "WAST":2,
    "WAT":1,
    "WEDT":1,
    "WEST":1,
    "WET": 0,
    "WIT":7,
    "WST":8,
    "YAKT":9,
    "YEKT":5,
    "Z": 0
};
exports.command = {
    name: "time",
    desc: "The time ime",
    usage: "time <timezone>",
    func: function(user, userID, channel, args, message, bot){
        var d = new Date();
        var utc  = d.getTime() - (d.getTimezoneOffset()*6000);
        var now;
        if(args[1]) {
            args[1] = args[1].toUpperCase();
            var offset = 0;
            if (timezones[args[1]]) {
                offset = timezones[args[1]];
            } else if (!isNaN(args[1])) {
                offset = args[1]*3600000;
            } else {
                bot.sendMessage({
                    to: channel,
                    message: "Invalid timezone"
                });
                return true;
            }
            now = new Date(utc + (3600000*offset));

        }else{
            now = new Date();
        }
        var emoji = ":clock"+(now.getHours() > 12 ? now.getHours()-12 : now.getHours());
        if(now.getMinutes() >= 30)
            emoji+="30";
        emoji += ":";


        bot.sendMessage({
        	to: channel,
        	message: `${emoji} The time${args[1] ? " in "+args[1] : ""} is *${(now.getHours()<10?'0':'')+now.getHours()}:${(now.getMinutes()<10?'0':'') +now.getMinutes()}:${(now.getSeconds()<10?'0':'')+now.getSeconds()}*`
        });

        return true;
    }
};

