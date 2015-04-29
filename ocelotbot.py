#-*- encoding: utf-8 -*-
from module import *
from constants import *
import time
import thread

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
        commands = moduleClass().getCommands()

        #add name into moduleCommands with the name and class stored in order to call it as a class object
        for commandName in commands:
            BotConstants.moduleCommands[commandName] = {
                "name": name,
                "class": moduleClass()
            }

#process commands
def processMessage(chanMessage, userMessage, channel, data):
    #get the name of the command without @
    chanMessage = chanMessage.split("@")[1]
    if BotConstants.moduleCommands.has_key(chanMessage) == 1:
        #get the function object from the command name entry in moduleCommands, then run it with the arguments (everything after the command separated by spaces)
        thread.start_new_thread(getattr(BotConstants.moduleCommands[chanMessage]["class"], chanMessage), (channel, userMessage.split()[1:]))
    else:
        #command not found
        Util().sendMessage(channel, "Command \"%s\" not found." % chanMessage)

#load modules and start loop
loadModules()
while True:
    data = irc.recv(8192)
    print data.rstrip("\n")

    if data.find("PING") != -1:
        irc.send("PONG %s\r\n" % data.split()[1])

    if data.find("332") != -1:
        topicData = data.split("##Ocelotworks :")
        if len(topicData) >= 2:
            db = BotConstants.database
            LoggingModule().updateTopicCounts(db)

            #get current topic ID from
            currentTopic = topicData[1].rstrip("\r\n")
            db.execute("SELECT id FROM `Topics` WHERE topic = %s", [currentTopic])
            BotConstants.connection.commit()
            topicIDResult = db.fetchall()
            if len(topicIDResult) == 1 and len(topicIDResult[0]) == 1:
                BotConstants.currentTopicID = topicIDResult[0][0]

    #whole thing
    userMessage = ":".join(data.split(":")[2:]).strip()

    #only first word
    chanMessage = userMessage.split(" ")[0].strip()
    channel = data.split(" ")

    #check if message is from user PM/channel or from server
    if len(channel) > 2:
        channel = channel[2]
    else:
        channel = ""

    #if the channel is our username, it's a PM so get the sender nickname
    if channel == nickname:
        channel = data.split(" ")[0].split(":")[1].split("!")[0]

    if channel == "##Ocelotworks":
        BotConstants.messageCount += 1
        if BotConstants.messageCount > 100:
            LoggingModule().updateTopic(args = ["up"])
            BotConstants.messageCount = 0

    #starts with an @ so process it as a command
    if chanMessage.startswith("@"):
        processMessage(chanMessage, userMessage, channel, data)
    else:
        UtilityModule().snarf(channel, userMessage)

    if channel.startswith("#"):
        if chanMessage.startswith("@"):
            time.sleep(1)

        username = data.split(":")[1].split("!")[0]
        timeString = time.strftime("%d %b, %H:%M")
        LoggingModule().logger(channel, username, userMessage, timeString)