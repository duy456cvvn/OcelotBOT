from . import ModuleBase, Util, RedditModule
from RedditModule import RedditURLOpener
from constants import *
import re, json, traceback
import time, hashlib, urllib2, requests
from bs4 import BeautifulSoup

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
            Util().sendMessage(channel, "Usage: @setaccesslevel <username> <accesslevel>")

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
        Util().sendMessage(channel, "Commands: {0}".format(commandList))

    def getAccesslevel(self, username):
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
                    Util().sendMessage(channel, "Level set successfully")
                else:
                    raise Exception()
            except:
                Util().sendMessage(channel, "{0} is not a valid level. Only {1}".format(accessLevel, ", ".join(str(level) for level in validLevels)))
        else:
            self.tooltip(channel, args = {"command": "setaccesslevel"})

    def binaryToString(self, channel, userMessage):
        userMessage = userMessage.replace(" ", "")
        binarySplit = [userMessage[start:start+8].zfill(8) for start in range(0, len(userMessage), 8)]
        try:
            for index, octet in enumerate(binarySplit):
                binarySplit[index] = int(octet, 2)

            message = "".join(map(chr, binarySplit))
            Util().sendMessage(channel, "Converted: \"{0}\"".format(message))
        except ValueError:
            pass

    def getShortURL(self, url):
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

    def snarf(self, channel, userMessage):
        userMessage = userMessage.lower()
        try:
            #r/thing
            subredditRegex = re.compile(ur' r/([^\s\/;\-\.,!?]+)')
            subredditResult = re.findall(subredditRegex, " " + userMessage)

            #u/thing
            userRegex = re.compile(ur'\bu/([^\s\/;\-\.,!?]+)\b')
            userResult = re.findall(userRegex, userMessage)

            #reddit.com/anything
            postRegex = re.compile(ur'http://(www\.)?reddit.com/(.*)')
            postResult = re.findall(postRegex, userMessage)

            if len(subredditResult) == 1:
                subredditJSON = RedditURLOpener().open("http://api.reddit.com/r/{0}/about".format(subredditResult[0])).read()
                subredditJSON = json.loads(subredditJSON)
                if subredditJSON.has_key("error") != 1:
                    Util().sendMessage(channel, "\x02http://reddit.com/r/{0} - {1}".format(subredditJSON["data"]["display_name"], subredditJSON["data"]["title"]))
                else:
                    Util().sendMessage(channel, "/r/{0} does not exist or is banned.".format(subredditResult[0]))

            if len(userResult) == 1:
                userJSON = RedditURLOpener().open("http://api.reddit.com/user/{0}/about".format(userResult[0])).read()
                userJSON = json.loads(userJSON)
                if userJSON.has_key("error") != 1:
                    Util().sendMessage(channel, "http://reddit.com/u/{0} - {1} link karma | {2} comment karma".format(userJSON["data"]["name"], str(userJSON["data"]["link_karma"]), str(userJSON["data"]["comment_karma"])))
                else:
                    Util().sendMessage(channel, "/u/{0} does not exist or is banned.".format(subredditResult[0]))

            if len(postResult) >= 1 and len(userResult) == 0 and len(subredditResult) == 0:
                postJSON = RedditURLOpener().open("http://api.reddit.com/{0}".format(postResult[0][1])).read()
                postJSON = json.loads(postJSON)
                postJSON = postJSON["data"]["children"][0]["data"] if type(postJSON) is dict else postJSON[0]["data"]["children"][0]["data"]
                if type(postJSON) != "dictionary":
                    message = "\x02{0} ({1})".format(postJSON["title"], postJSON["domain"])
                    message += " \x034NSFW\x03" if bool(postJSON["over_18"]) else ""

                    Util().sendMessage(channel, message)
                else:
                    Util().sendMessage(channel, "/{0} does not exist or is banned.".format(subredditResult[0]))


            #normal url snarfing
            urlCheck = re.compile(ur'((http|https)://[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-@?^=%&amp;/~\+#])?)')
            urlResult = re.findall(urlCheck, userMessage)
            if len(urlResult) > 0:
                urls = [u[0] for u in urlResult]
                for u in urls:
                    try:
                        res = requests.get(u)
                    except:
                        res = None

                    if res is not None and res.status_code == 200:
                        html = res.content
                        soup = BeautifulSoup(html)

                        titleElem = soup.find("meta", attrs = {"property": "og:title"})
                        if titleElem is not None and "content" in titleElem:
                            title = titleElem["content"]
                        else:
                            try:
                                title = soup.title.string
                            except AttributeError:
                                title = None

                        descElem = soup.find("meta", attrs = {"property": "og:description"})
                        if descElem is not None:
                            desc = descElem["content"]
                            print "desc: {0}".format(desc)
                        else:
                            descElem = soup.find("meta", attrs = {"name": "description"})
                            if descElem is not None:
                                desc = descElem["content"]
                            else:
                                desc = None

                        title = title.replace("\n", "") if title is not None else None
                        desc = desc.replace("\n", "") if desc is not None else None

                        snarfMsg = "{0}{1}".format(("{0}".format(title) if title is not None and title != "" else ""), (" - {0}".format(desc) if desc is not None and desc != "" else ""))
                        if snarfMsg.rstrip().lstrip() != "":
                            Util().sendMessage(channel, snarfMsg)
        except:
            traceback.print_exc()
            pass