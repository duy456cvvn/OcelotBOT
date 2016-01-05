from . import ModuleBase, Util, UtilityModule
from constants import *
import youtube_dl, thread, urllib2, os, requests

class YouTubeDLModule(ModuleBase):
    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "YouTube-DL Module"

    def getCommands(self):
        return ["youtube", "mixcloud", "soundcloud", "bandcamp", "nowplaying"]

    def tooltip(self, channel, args):
        Util.sendMessage(self.channel, "Usage: @{0} <{0} url>".format(args["command"]))

    def downloadHook(self, download):
        if download["status"] == "finished":
            self.shouldFinish = True
            Util.sendMessage(self.channel, "Done downloading, converting if needed...")

    def debug(self, msg):
        print(msg)
        #grabs the final file name from the youtube-dl output (with the forcefilename option) a
        if msg.startswith("/home/peter/mp3/"):
            #remove whatever original extension might have been there and replace with mp3 for final file name
            self.fileName = msg.split("/home/peter/mp3/")[1].split(".")
            self.fileName = ".".join(self.fileName[:-1]) + ".mp3"

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)
        #remove the bash color from the error string
        msg = msg.split("[0;31mERROR:[0m ")[1]
        #add IRC coloring to error message and send
        Util.sendMessage(self.channel, "\x034ERROR:\x03 {0}".format(msg))
        #stop the output of the file URL
        self.shouldFinish = False

    #downloader function used universally by all the media download commands
    def downloader(self, channel, args):
        self.channel = channel
        if args[0] is not None:
            youtubeDownloaderOptions = {
                "format": "bestaudio/best",
                "postprocessors": [{
                   "key": "FFmpegExtractAudio",
                   "preferredcodec": "mp3"
                }],
                "logger": self,
                "progress_hooks": [self.downloadHook],
                "outtmpl": "/home/peter/mp3/%(title)s.%(ext)s",
                "forcefilename": True,
                "restrictfilenames": True
            }

            if args[1] == "youtube":
                youtubeDownloaderOptions["proxy"] = BotConstants.config["misc"]["proxyURL"]

            try:
                Util.sendMessage(channel, "Downloading, please wait...")
                with youtube_dl.YoutubeDL(youtubeDownloaderOptions) as ydl:
                    ydl.download([args[0]])
            except Exception:
                #stop the bot from killing itself at an exception
                self.shouldFinish = False
            pass

            if self.shouldFinish:
                #replace _'s in name with spaces and rename
                newFileName = self.fileName.replace("_", " ")
                os.rename("/home/peter/mp3/{0}".format(self.fileName), "/home/peter/mp3/{0}".format(newFileName))
                self.fileName = newFileName

                #put together the mp3 url by url encoding the mp3 name
                urlString = "http://files.unacceptableuse.com/{0}".format(urllib2.quote(self.fileName.encode("utf8")))
                shortURL = UtilityModule.getShortURL(urlString)

                #send short url
                Util.sendMessage(channel, "\x033The requested MP3 can be found at: {0}".format(shortURL))
        else:
            #send tooltip with command set in args to the command executed by user
            self.tooltip(channel, args = {"command": args[1]})

    #youtube command
    @staticmethod
    def youtube(channel, args):
        #create argument array with only information needed
        args = [
            #if the args from the IRC message didn't have anything, set to None. otherwise use the argument provided
            args[0] if len(args) >= 1 else None,
            #the command name, used for tooltip and if statements
            "youtube"
        ]

        thread.start_new_thread(YouTubeDLModule().downloader, (channel, args))

    #mixcloud command
    @staticmethod
    def mixcloud(channel, args):
        args = [
            args[0] if len(args) >= 1 else None,
            "mixcloud"
        ]

        thread.start_new_thread(YouTubeDLModule().downloader, (channel, args))

    #soundcloud command
    @staticmethod
    def soundcloud(channel, args):
        args = [
            args[0] if len(args) >= 1 else None,
            "soundcloud"
        ]

        thread.start_new_thread(YouTubeDLModule().downloader, (channel, args))

    #bandcamp command
    @staticmethod
    def bandcamp(channel, args):
        args = [
            args[0] if len(args) >= 1 else None,
            "bandcamp"
        ]

        thread.start_new_thread(YouTubeDLModule().downloader, (channel, args))

    @staticmethod
    def nowplaying(channel, args):
        res = requests.get(BotConstants.config["misc"]["radioNowPlayingURL"])
        if res.status_code == 200:
            rJSON = res.json()
            nowPlaying = " // ".join(["\x033{0}\x03: {1}".format(s["genre"], s["title"]) for s in rJSON["icestats"]["source"]])
            Util.sendMessage(channel, "\x02Now Playing:\x02 {0}".format(nowPlaying))