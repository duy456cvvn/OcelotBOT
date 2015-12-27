#-*- encoding: utf-8 -*-
from module import *
from constants import *
import time, thread

zncPass = BotConstants.config["irc"]["zncPass"]
nickname = "OcelotBOT"
username = "Ocelot"
realName = "Ocelot Bot"
server = "boywanders.us"
port = 1337

#irc socket in BotConstatnts to allow all modules to access and send messages to it
irc = BotConstants.irc
irc.connect((server, port))

#ident with ZNC
irc.write("PASS %s\r\n" % zncPass)

#required to receive anything from ZNC
irc.write("NICK %s\r\n" % nickname)
irc.write("USER %s %s %s %s %s\r\n" % (username, nickname, nickname, nickname, realName))

time.sleep(1)
irc.recv(8192)

#load all subclasses of ModuleBase aka the modules into BotConstants.moduleCommands
def loadModules():
    for moduleClass in ModuleBase.__subclasses__():
        #class name
        name = moduleClass.__name__
        #all commands from getCommands() in module
        moduleClassObj = moduleClass()
        commands = moduleClassObj.getCommands()

        #add name into moduleCommands with the name and class stored in order to call it as a class object
        for commandName in commands:
            BotConstants.moduleCommands[commandName] = {
                "name": name,
                "class": moduleClassObj
            }

#process commands
def processMessage(chanMessage, userMessage, channel, data):
    #get the name of the command without @
    chanMessage = chanMessage.split("@")[1].lower()
    userWhoSent = data.split(":")[1].split("!")[0]
    if BotConstants.moduleCommands.has_key(chanMessage) == 1:
        accessLevel = UtilityModule.getAccessLevel(userWhoSent)
        commandLevel = getattr(BotConstants.moduleCommands[chanMessage]["class"], "accessLevel")(chanMessage)
        if accessLevel >= commandLevel:
            #get the function object from the command name entry in moduleCommands, then run it with the arguments (everything after the command separated by spaces)
            thread.start_new_thread(getattr(BotConstants.moduleCommands[chanMessage]["class"], chanMessage), (channel, userMessage.split()[1:]))
        else:
            Util.sendMessage(channel, "You aren't a high enough level to run that command!")
    else:
        #command not found
        Util.sendMessage(channel, "Command \"%s\" not found." % chanMessage)

def isInt(n):
    try:
        int(n)
        return True
    except ValueError:
        return False

#load modules and start loop
loadModules()
while True:
    data = irc.recv(8192)
    print data.rstrip("\n")

    if data.find("PING") != -1:
        irc.send("PONG %s\r\n" % data.split()[1])

    if data.find("332") != -1:
        topicData = data.split("{0} :".format(BotConstants.config["irc"]["topicChannel"]))
        if len(topicData) >= 2:
            LoggingModule.updateTopicCounts()

            #get current topic ID from
            currentTopic = topicData[1].rstrip("\r\n")
            BotConstants().runQuery("SELECT id FROM `Topics` WHERE topic = %s", currentTopic)
            topicIDResult = BotConstants.db.fetchall()
            if len(topicIDResult) > 0:
                BotConstants.currentTopicID = topicIDResult[0]["id"]
            else:
                BotConstants.currentTopicID = 1

    if data.split()[1] == "402" or data.split()[1] == "317" and not TrackingModule.stopFlag.isSet():
        TrackingModule.handleTrackingData(data)

    if isInt(data.split()[1]):
        continue

    #whole thing
    userMessage = ":".join(data.split(":")[2:]).strip()

    #only first word
    commandMessage = userMessage.split(" ")[0].strip()
    channel = data.split(" ")

    #check if message is from user PM/channel or from server
    channel = channel[2] if len(channel) > 2 else ""

    #if the channel is our username, it's a PM so get the sender nickname
    if channel == nickname:
        channel = data.split(" ")[0].split(":")[1].split("!")[0]

    if channel == BotConstants.config["irc"]["topicChannel"]:
        BotConstants.messageCount += 1
        if BotConstants.messageCount > 100:
            LoggingModule().updateTopic(channel, args = ["up"])
            BotConstants.messageCount = 0

        BotConstants().runQuery("UPDATE `BotVars` SET val = %s WHERE name = 'autoTopicCount'", BotConstants.messageCount)

    #starts with an @ so process it as a command
    if commandMessage.startswith("@"):
        processMessage(commandMessage, userMessage, channel, data)
    else:
        thread.start_new_thread(UtilityModule.snarf, (channel, userMessage))

    if userMessage.startswith("0") or userMessage.startswith("1"):
        UtilityModule.binaryToString(channel, userMessage)

    if userMessage.lower() == "test":
        Util.sendMessage(channel, "icles")

    if channel.startswith("#"):
        if commandMessage.startswith("@"):
            time.sleep(1)

        userWhoSent = data.split(":")[1].split("!")[0]
        if userWhoSent != "ChanServ" and userWhoSent != nickname:
            timeString = time.strftime("%d %b, %H:%M:%S")
            LoggingModule.logger(channel, userWhoSent, userMessage, timeString)