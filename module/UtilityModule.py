from . import ModuleBase, Util, RedditModule
from RedditModule import RedditURLOpener
from constants import *
import re, json, traceback

#utility module for miscellaneous things such as @command
class UtilityModule(ModuleBase):
    def accessLevel(self):
        return AccessLevels.ADMIN

    def moduleName(self):
        return "YouTube-DL Module"

    def getCommands(self):
        return ["commands"]

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

    def snarf(self, channel, userMessage):
        try:
            #r/thing
            subredditRegex = re.compile(ur' r\/([^\s\/;\-\.,!?]+)')
            subredditResult = re.findall(subredditRegex, " " + userMessage)

            #u/thing
            userRegex = re.compile(ur'\bu\/([^\s\/;\-\.,!?]+)\b')
            userResult = re.findall(userRegex, userMessage)

            #reddit.com/anything
            postRegex = re.compile(ur'http:\/\/(www\.)?reddit.com\/(.*)')
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
        except:
            traceback.print_exc()
            pass

    def tooltip(self, channel, args):
        Util().sendMessage(channel, "Usage: @commands")