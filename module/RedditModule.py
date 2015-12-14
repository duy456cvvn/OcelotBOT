from . import ModuleBase, Util
from constants import AccessLevels
import random, requests

class RedditModule(ModuleBase):
    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "Reddit Module"

    def getCommands(self):
        return ["image", "randpost"]

    def image(self, channel, args):
        if len(args) >= 1 and args[0] is not None:
            res = requests.get("http://api.reddit.com/r/{0}".format(args[0]), headers = {"User-Agent": "OcelotBOT/1.0.0"})
            if res.status_code == 200:
                try:
                    rJSON = res.json()
                except ValueError:
                    Util.sendMessage(channel, "Error parsing /r/{0} JSON response".format(args[0]))
                    return

                allPosts = [post for post in rJSON["data"]["children"] if "imgur" in post["data"]["domain"]]
                if len(rJSON) >= 1:
                    post = random.choice(allPosts)

                    message = "{0}: {1}".format(post["data"]["title"], post["data"]["url"])
                    message += " \x02\x034[NSFW]\x03\x02" if bool(post["data"]["over_18"]) else ""
                    Util.sendMessage(channel, message)
                else:
                    Util.sendMessage(channel, "No images from imgur on /r/{0}".format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "image"})

    def randpost(self, channel, args):
        if len(args) >= 1 and args[0] is not None:
            res = requests.get("http://api.reddit.com/r/{0}".format(args[0]), headers = {"User-Agent": "OcelotBOT/1.0.0"})
            if res.status_code == 200:
                try:
                    rJSON = res.json()
                except ValueError:
                    Util.sendMessage(channel, "Error parsing /r/{0} JSON response".format(args[0]))
                    return

                allPosts = rJSON["data"]["children"]
                if len(allPosts) >= 1:
                    post = random.choice(allPosts)

                    message = "{0}: http://redd.it/{1}".format(post["data"]["title"], post["data"]["id"])
                    message += " \x02\x034[NSFW]\x03\x02" if bool(post["data"]["over_18"]) else ""
                    Util.sendMessage(channel, message)
                else:
                    Util.sendMessage(channel, "No posts on /r/{0} or /r/{0} doesnt exist".format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "randpost"})
        return

    def tooltip(self, channel, args):
        if args["command"] == "image" or args["command"] == "randpost":
            Util.sendMessage(channel, "Usage: @{0} <subreddit name>".format(args["command"]))