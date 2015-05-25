from . import ModuleBase, Util
from threading import Thread, Event
from constants import *
import time

class TrackingModule(ModuleBase):
    usersToTrack = []
    stopFlag = Event()

    def accessLevel(self):
        return AccessLevels.ADMIN

    def moduleName(self):
        return "Tracking Module"

    def getCommands(self):
        return ["track", "stoptrack"]

    def tooltip(self, channel, args):
        Util().sendMessage(channel, "you got this somehow. not sure how, but you did")

    class TrackThread(Thread):
        def __init__(self, event, usersToTrack):
            Thread.__init__(self)
            self.stopped = event
            self.usersToTrack = usersToTrack

        def run(self):
            while not self.stopped.wait(60):
                for user in self.usersToTrack:
                    BotConstants.irc.send("WHOIS {0} :{0}\r\n".format(user))
                    if len(self.usersToTrack) > 1:
                        time.sleep(3)

    def trackInitialize(self):
        BotConstants().runQuery("SELECT * FROM `ActivityTrackingUsers`")
        result = BotConstants.db.fetchall()
        if len(result) >= 1:
            for user in result:
                if user["username"] not in self.usersToTrack:
                    self.usersToTrack.append(user["username"])

    def track(self, channel, args):
        self.trackInitialize()
        self.stopFlag.clear()
        thread = self.TrackThread(self.stopFlag, self.usersToTrack)
        thread.start()
        Util().sendMessage(channel, "Now tracking: {0}".format(", ".join(self.usersToTrack)))

    def stoptrack(self, channel, args):
        self.stopFlag.set()
        Util().sendMessage(channel, "Tracking stopped.")

    def handleTrackingData(self, data):
        splitData = data.split()
        dataCode = splitData[1]
        nickForData = splitData[3]

        BotConstants().runQuery("SELECT * FROM `ActivityTracking` WHERE username = %s AND isOnline = '1' ORDER BY id DESC LIMIT 1", nickForData)
        result = BotConstants.db.fetchall()

        if dataCode == "402":
            if len(result) >= 1:
                timestamp = int(time.mktime(time.localtime()))
                BotConstants().runQuery("UPDATE `ActivityTracking` SET isOnline = '0', logoffTime = %s WHERE id = %s", timestamp, result[0]["id"])
        elif dataCode == "317":
            signOnTime = splitData[5]
            if len(result) < 1:
                BotConstants().runQuery("INSERT INTO `ActivityTracking` (username, loginTime, logoffTime, isOnline) VALUES (%s, %s, '0', '1')", nickForData, signOnTime)