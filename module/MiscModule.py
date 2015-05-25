from . import ModuleBase, Util
from constants import *

class MiscModule(ModuleBase):
    def accessLevel(self):
        return AccessLevels.ADMIN

    def moduleName(self):
        return "Miscellaneous Module"

    def getCommands(self):
        return ["meme"]

    def tooltip(self, channel, args):
        if args["command"] == "meme":
            Util().sendMessage(channel, "Usage: @meme [add/remove] <name> [url]")

    def meme(self, channel, args):
        def checkMemeExists(name):
            BotConstants().runQuery("SELECT url FROM `Memes` WHERE name = %s", name)
            memes = BotConstants.db.fetchall()
            if len(memes) == 0:
                return False
            else:
                return memes

        if len(args) >= 1:
            if args[0] == "add":
                if len(args) >= 3:
                    memeName = args[1]
                    memeURL = args[2]
                    meme = checkMemeExists(memeName)
                    if not meme:
                        BotConstants().runQuery("INSERT INTO `Memes` (name, url) VALUES (%s, %s)", memeName, memeURL)
                        Util().sendMessage(channel, "Meme \"{0}\" added.".format(memeName))
                    else:
                        Util().sendMessage(channel, "Meme \"{0}\" already exists".format(memeName))
                else:
                    Util().sendMessage(channel, "You must provide a name and URL when adding a meme.")
            elif args[0] == "remove":
                if len(args) >= 2:
                    meme = checkMemeExists(args[1])
                    if not meme:
                        Util().sendMessage(channel, "No meme called \"{0}\" found. Please try again.".format(args[1]))
                    else:
                        BotConstants().runQuery("DELETE FROM `Memes` WHERE name = %s", args[1])
                        Util().sendMessage(channel, "Meme \"{0}\" deleted.".format(args[1]))
                else:
                    Util().sendMessage(channel, "You must provide a name when deleting a meme.")
            else:
                meme = checkMemeExists(args[0])
                if not meme:
                    Util().sendMessage(channel, "No meme called \"{0}\" found. Please try again.".format(args[0]))
                else:
                    Util().sendMessage(channel, meme[0][0])
        else:
            self.tooltip(channel, args = {"command": "meme"})