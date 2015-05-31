from . import ModuleBase, Util
from constants import AccessLevels
from urllib import FancyURLopener
import json
import random
import re
import traceback

class RedditModule(ModuleBase):
    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "Reddit Module"

    def getCommands(self):
        return ["image", "randpost"]

    def image(self, channel, args):
        if len(args) >= 1 and args[0] is not None:
            subredditJSON = RedditURLOpener().open("http://api.reddit.com/r/{0}".format(args[0])).read()
            subredditJSON = json.loads(subredditJSON)["data"]["children"]
            subredditJSON = [post for post in subredditJSON if "imgur" in post["data"]["domain"]]
            if len(subredditJSON) >= 1:
                randomIndex = random.randint(0, len(subredditJSON) - 1)
                post = subredditJSON[randomIndex]

                message = "{0}: {1}".format(post["data"]["title"], post["data"]["url"])
                message += " \x02\x034[NSFW]\x03\x02" if bool(post["data"]["over_18"]) else ""
                Util().sendMessage(channel, message)
            else:
                Util().sendMessage(channel, "No images from imgur on /r/{0}".format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "image"})

    def randpost(self, channel, args):
        if len(args) >= 1 and args[0] is not None:
            subredditJSON = RedditURLOpener().open("http://api.reddit.com/r/{0}".format(args[0])).read()
            subredditJSON = json.loads(subredditJSON)["data"]["children"]
            if len(subredditJSON) >= 1:
                randomIndex = random.randint(0, len(subredditJSON) - 1)
                post = subredditJSON[randomIndex]

                message = "{0}: http://redd.it/{1}".format(post["data"]["title"], post["data"]["id"])
                message += " \x02\x034[NSFW]\x03\x02" if bool(post["data"]["over_18"]) else ""
                Util().sendMessage(channel, message)
            else:
                Util().sendMessage(channel, "No posts on /r/{0} or /r/{0} doesnt exist".format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "randpost"})
        return

    def tooltip(self, channel, args):
        if args["command"] == "image" or args["command"] == "randpost":
            Util().sendMessage(channel, "Usage: @{0} <subreddit name>".format(args["command"]))


#custom url opener wrapper around urllib to help reddit not to flag us as a shitty bot ;)
class RedditURLOpener(FancyURLopener, object):
    #custom User-Agent
    version = "OcelotBOT/1.0.0"