from . import ModuleBase, Util
from constants import *
import re, json
import time, hashlib, urllib2, requests

#utility module for miscellaneous things such as @command
class UtilityModule(ModuleBase):
	def accessLevel(self, commandName):
		if commandName == "setaccesslevel":
			return AccessLevels.GOD
		else:
			return AccessLevels.USER

	def moduleName(self):
		return "YouTube-DL Module"

	def getCommands(self):
		return ["commands", "setaccesslevel"]

	def tooltip(self, channel, args):
		if args["command"] == "setaccesslevel":
			Util.sendMessage(channel, "Usage: @setaccesslevel <username> <accesslevel>")

	def commands(self, channel, args):
		#init string
		commandList = ""

		#gets each command name from BotConstants moduleCommands dictionary
		for commandName in BotConstants.moduleCommands.keys():
			#appends to commandList string
			commandList += "@{0}, ".format(commandName)

		#remove excess ", " from final string
		commandList = commandList.rstrip(", ")

		#send result to request source
		Util.sendMessage(channel, "Commands: {0}".format(commandList))

	@staticmethod
	def getAccessLevel(username):
		BotConstants().runQuery("SELECT Level FROM `Access_Levels` WHERE Username = %s", username)
		result = BotConstants().db.fetchall()
		if len(result) >= 1:
			return result[0]["Level"]
		else:
			return 0

	def setaccesslevel(self, channel, args):
		if len(args) >= 2:
			validLevels = [-1, 0, 2, 69]
			username = args[0]
			accessLevel = args[1]
			try:
				accessLevel = int(accessLevel)
				if accessLevel in validLevels:
					BotConstants().runQuery("INSERT INTO `Access_Levels` (Username, Level) VALUES (%s, %s) ON DUPLICATE KEY UPDATE Level = VALUES(Level)", username, accessLevel)
					Util.sendMessage(channel, "Level set successfully")
				else:
					raise Exception()
			except:
				Util.sendMessage(channel, "{0} is not a valid level. Only {1}".format(accessLevel, ", ".join(str(level) for level in validLevels)))
		else:
			self.tooltip(channel, args = {"command": "setaccesslevel"})

	@staticmethod
	def binaryToString(channel, userMessage):
		userMessage = userMessage.replace(" ", "")
		binarySplit = [userMessage[start:start+8].zfill(8) for start in range(0, len(userMessage), 8)]
		try:
			for index, octet in enumerate(binarySplit):
				binarySplit[index] = int(octet, 2)

			message = "".join(map(chr, binarySplit))
			Util.sendMessage(channel, "Converted: \"{0}\"".format(message))
		except ValueError:
			pass

	@staticmethod
	def getShortURL(url):
		#generate the timestamp and signature by md5-ing the timestamp + the api secret key
		timestamp = int(time.time())
		md5 = hashlib.md5()
		md5.update("{0}{1}".format(timestamp, BotConstants.config["misc"]["urlShortKey"]))
		signature = md5.hexdigest()

		#request short URL
		shortURL = urllib2.urlopen("https://boywanders.us/short/yourls-api.php?signature={0}&timestamp={1}&action=shorturl&url={2}&format=json".format(signature, timestamp, url)).read()
		shortURL = json.loads(shortURL)
		shortURL = shortURL["shorturl"]

		return shortURL

	@staticmethod
	def getJSON(response):
		rJSON = False
		if isinstance(response, requests.models.Response):
			try:
				rJSON = response.json()
			except ValueError:
				pass

		return rJSON

	@staticmethod
	def snarf(channel, userMessage):
		urlRegex = lambda msg: re.findall("((http|https)://[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&;:/~\+#]*[\w\-@?^=%&;/~\+#])?)", msg)
		redditURLRegex = "(http|https)://(www\.)?reddit.com/([^\s]+)"

		origUserMessage = userMessage
		userMessage = userMessage.lower()
		session = requests.Session()
		session.headers = {
			"User-Agent": "OcelotBOT/1.0.0"
		}

		#r/thing
		subResult = re.findall("^(?!{0}).*r/([^\s/;\-\.,!?]+)".format(redditURLRegex), userMessage)
		if len(subResult) > 0:
			subName = subResult[0][-1]
			res = session.get("http://api.reddit.com/r/{0}/about".format(subName))
			if res.status_code == 200:
				rJSON = UtilityModule.getJSON(res)
				if "error" not in rJSON:
					Util.sendMessage(channel, "\x02http://reddit.com/r/{0} - {1}".format(rJSON["data"]["display_name"], rJSON["data"]["title"]))
			else:
				Util.sendMessage(channel, "/r/{0} does not exist or is banned.".format(subName))

		#u/thing
		userResult = re.findall("u/([^\s/;\-\.,!?]+)", userMessage)
		if len(userResult) > 0:
			res = session.get("http://api.reddit.com/user/{0}/about".format(userResult[0]))
			if res.status_code == 200:
				rJSON = UtilityModule.getJSON(res)
				if "error" not in rJSON:
					Util.sendMessage(channel, "http://reddit.com/u/{0} - {1} link karma | {2} comment karma".format(rJSON["data"]["name"], rJSON["data"]["link_karma"], rJSON["data"]["comment_karma"]))
			else:
				Util.sendMessage(channel, "/u/{0} does not exist or is banned.".format(userResult[0]))


		#fallback
		postResult = re.findall(redditURLRegex, userMessage)
		if len(postResult) > 0 and len(userResult) == 0 and len(subResult) == 0:
			res = session.get("http://api.reddit.com/{0}".format(postResult[0][-1]))
			if res.status_code == 200:
				postJSON = UtilityModule.getJSON(res)
				postJSON = postJSON["data"]["children"][0]["data"] if type(postJSON) is dict else postJSON[0]["data"]["children"][0]["data"]
				if type(postJSON) != "dictionary":
					message = "\x02{0} ({1})".format(postJSON["title"], postJSON["domain"])
					message += " \x034NSFW\x03" if bool(postJSON["over_18"]) else ""

					Util.sendMessage(channel, message)
				else:
					Util.sendMessage(channel, "/{0} does not exist or is banned.".format(subResult[0]))


		#normal url snarfing
		urlResult = urlRegex(origUserMessage)
		if len(urlResult) > 0:
			urls = []
			for u in urlResult:
				if len(re.findall(redditURLRegex, u[0])) == 0: urls.append(u[0])
			for u in urls:
				try:
					res = requests.get(u, headers = {"User-Agent": "OcelotBOT/1.0.0"})
				except:
					res = None

				if res is not None and res.status_code == 200:
					html = res.content
					metaFormat = '<meta(?=\s|>)(?=(?:[^>=]|=\'[^\']*\'|="[^"]*"|=[^\'"][^\s>]*)*?\s{1}=(?:\'{0}|"{0}"|{0}))(?=(?:[^>=]|=\'[^\']*\'|="[^"]*"|=[^\'"][^\s>]*)*?\scontent=(\'([^\']*)\'|"([^"]*)"|))(?:[^\'">=]*|=\'[^\']*\'|="[^"]*"|=[^\'"][^\s>]*)*>'

					title = re.findall(metaFormat.format("og:title", "property"), html)
					if len(title) > 0:
						title = title[0][-1]
					else:
						title = re.findall("<title>([^<]+)</title>", html)
						if len(title) > 0:
							title = title[0]
						else:
							title = None

					descElem = re.findall(metaFormat.format("og:description", "property"), html)
					if len(descElem) > 0:
						desc = descElem[0][-1]
					else:
						descElem = re.findall(metaFormat.format("og:description", "name"), html)
						print descElem
						if len(descElem) > 0:
							desc = descElem[0][-1]
						else:
							desc = None

					title = title.replace("\n", "") if title is not None else None
					desc = desc.replace("\n", "") if desc is not None else None

					snarfMsg = "{0}{1}".format(("{0}".format(Util.u8(title)) if title is not None and title != "" else ""), (" - {0}".format(Util.u8(desc)) if desc is not None and desc != "" else ""))
					if snarfMsg.rstrip().lstrip() != "":
						Util.sendMessage(channel, snarfMsg)