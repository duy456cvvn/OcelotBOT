from . import ModuleBase, Util, YouTubeDLModule, UtilityModule
from constants import *
import re, requests, os

class ArchiveModule(ModuleBase):
    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "Archive Module"

    def getCommands(self):
        return ["archive"]

    def tooltip(self, channel, args):
        if args["command"] == "archive":
            Util.sendMessage(channel, "Usage: @archive [url]")

    def archive(self, channel, args):
        if len(args) >= 1:
            archiveURL = self.checkURLRegex(args[0])
            youtubeURL = self.checkYoutubeRegex(archiveURL)
            if archiveURL:
                req = requests.head(archiveURL, allow_redirects = True, headers = {"Accept-Encoding": "identity"})
                if req.status_code == 200 or youtubeURL:
                    contentType = req.headers["content-type"] if "content-type" in req.headers else ""
                    if not youtubeURL and "text/html" in contentType:
                        Util.sendMessage(channel, "Not archiving because it is a website.")
                    else:
                        if youtubeURL:
                            YouTubeDLModule.youtube(channel, args=["https://youtube.com/{0}".format(youtubeURL)])
                        else:
                            Util.sendMessage(channel, "Archiving ({0})...".format(self.sizeof_fmt(req.headers["content-length"])))
                            fileInfo = self.download(archiveURL)
                            fileURLString = "http://mirrors.boywanders.us/{0}/{1}".format(fileInfo["extension"], fileInfo["filename"])
                            fileURL = UtilityModule.getShortURL(fileURLString)
                            Util.sendMessage(channel, "File archived and available here: \x033{0}".format(fileURL))
                else:
                    Util.sendMessage(channel, "Bad URL or offline.")
            else:
                Util.sendMessage(channel, "Invalid URL to archive.")
        else:
            self.tooltip(channel, args = {"command": "archive"})

    def download(self, url):
        filename = url.split("/")[-1]
        fileExtension = filename.split(".")[-1]
        filePath = "{0}/{1}".format("/home/mirror/mirrors", fileExtension)
        r = requests.get(url, stream = True)
        if not os.path.exists(filePath):
            os.makedirs(filePath)

        with open("{0}/{1}".format(filePath, filename), "wb") as f:
            for chunk in r.iter_content(chunk_size = 1024):
                if chunk: #filter out keep-alive new chunks
                    f.write(chunk)
                    f.flush()

        return {"extension": fileExtension, "filename": filename}

    def sizeof_fmt(self, num, suffix='B'):
        for unit in ['','Ki','Mi','Gi','Ti','Pi','Ei','Zi']:
            if abs(num) < 1024.0:
                return "%3.1f%s%s" % (num, unit, suffix)
            num /= 1024.0

        return "%.1f%s%s" % (num, 'Yi', suffix)

    def checkURLRegex(self, str):
        pattern = re.compile(ur'^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\xa1-\xff0-9]+-?)*[a-z\xa1-\xff0-9]+)(?:\.(?:[a-z\xa1-\xff0-9]+-?)*[a-z\xa1-\xff0-9]+)*(?:\.(?:[a-z\xa1-\xff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$', re.IGNORECASE | re.UNICODE | re.DOTALL)
        searchResult = re.match(pattern, str)
        if searchResult:
            return searchResult.group()
        else:
            return False

    def checkYoutubeRegex(self, str):
        pattern = re.compile(ur'^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(.+)$')
        searchResult = re.search(pattern, str)
        if searchResult:
            return searchResult.groups()[-1]
        else:
            return False