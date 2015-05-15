from . import ModuleBase, Util, UtilityModule
from constants import *
import warnings
import MySQLdb
import random
import time
from datetime import datetime
import math
import re

class LoggingModule(ModuleBase):
    def accessLevel(self):
        return AccessLevels.ADMIN

    def moduleName(self):
        return "Logging Module"

    def getCommands(self):
        return ["topic", "sentence", "seen"]

    def checkAccessLevel(self, channel, args):
        return

    def tooltip(self, channel, args):
        if args["command"] == "sentence":
            Util().sendMessage(channel, "Usage: @sentence <word(s)> [-context #]")
        elif args["command"] == "seen":
            Util().sendMessage(channel, "Usage: @seen <nickname>")

    def logger(self, channel, username, message, time):
        db = BotConstants.database
        channel = channel.rstrip()
        try:
            if channel not in BotConstants.tables:
                db.execute("CREATE TABLE IF NOT EXISTS `{0}` (ID int NOT NULL AUTO_INCREMENT, Time text,Username text,Message text, PRIMARY KEY (ID))".format(channel))
                BotConstants.connection.commit()

            db.execute("INSERT INTO `{0}` (`Time`, `Username`, `Message`) VALUES (%s, %s, %s)".format(channel), [time, username, message])
            BotConstants.connection.commit()
        except MySQLdb.OperationalError:
            BotConstants().reconnect()
            self.logger(channel, username, message, time)

    def sentence(self, channel, args):
        if len(args) >= 1:
            db = BotConstants.database
            index = 0
            bCtx = 0
            fCtx = 0
            cIndex = None
            for arg in args:
                if arg == "-context":
                    cIndex = index
                    try:
                        ctx = int(args[index + 1])
                        ctx = abs(ctx)
                    except:
                        Util().sendMessage(channel, "Invalid context amount")
                        return
                    fCtx = math.ceil(ctx / 2)
                    bCtx = ctx - fCtx
                index += 1
                
                if cIndex is not None:
                    args.pop(cIndex + 1)
                    args.pop(cIndex)
                
                searchTerm = " ".join(args)
            db.execute("SELECT * FROM `{0}` WHERE Message LIKE %s  AND Message NOT LIKE \"@sentence%%\"".format(channel), ["%{0}%".format(searchTerm)])
            BotConstants.connection.commit()

            result = db.fetchall()
            if len(result) != 0:
                randomMessage = random.choice(result)
                db.execute("""(SELECT * FROM (SELECT * FROM `{0}` WHERE ID < %s ORDER BY ID DESC LIMIT %s) tmp ORDER BY tmp.ID ASC)
                              UNION ALL (SELECT * FROM `{0}` WHERE ID = %s)
                              UNION ALL (SELECT * FROM `{0}` WHERE ID > %s ORDER BY ID ASC LIMIT %s)""".format(channel), [randomMessage[0], bCtx, randomMessage[0], randomMessage[0], fCtx])
                BotConstants.connection.commit()
                result = db.fetchall()

                if len(result) != 0:
                    index = 0
                    for message in result:
                        messageString = message[3]
                        if index == bCtx:
                            search = re.compile(r"({0})".format(searchTerm), re.I)
                            messageString = search.sub("\x02\x034\\1\x03\x02", messageString)
                        
                        Util().sendMessage(channel, "<{0}> {1}".format(message[2], messageString))
                        index += 1

            else:
                Util().sendMessage(channel, "No messages containing \"{0}\"".format(searchTerm))
        else:
            self.tooltip(channel, args = {"command": "sentence"})

    def seen(self, channel, args):
        if len(args) >= 1:
            db = BotConstants.database
            db.execute("SELECT * FROM `{0}` WHERE Username = %s ORDER BY ID DESC LIMIT 1".format(channel), [args[0]])
            BotConstants.connection.commit()

            result = db.fetchall()
            if len(result) != 0:
                result = result[0]
                try:
                    messageTime = datetime.strptime(result[1], "%d %b, %H:%M:%S")
                except ValueError:
                    messageTime = datetime.strptime(result[1], "%d %b, %H:%M")

                now = datetime.strptime(time.strftime("%d %b, %H:%M:%S"), "%d %b, %H:%M:%S")
                timeDelta = now - messageTime

                Util().sendMessage(channel, "{0} was last seen at {1} ({2} ago) with the message: {3}".format(args[0], result[1], timeDelta, result[3]))
            else:
                Util().sendMessage(channel, "User \"{0}\" has never been logged in this channel".format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "seen"})

    def topic(self, channel, args):
        db = BotConstants.database
        try:
            if len(args) >= 1:
                if args[0] == "up" or args[0] == "down" or args[0] == "removecurrent" or args[0] == "removeindex":
                    self.updateTopic(args)
                    return
                else:
                    index = args[0]
            else:
                index = 0

            #will throw exception if index isn't an int
            int(index)

            #continue on
            db.execute("SELECT Username, Message FROM `{0}` WHERE ID = (SELECT MAX(ID) - %s FROM `{0}`)".format(channel), [index])
            BotConstants.connection.commit()
            topicResult = db.fetchall()

            if len(topicResult) != 0:
                topicResult = topicResult[0]
                if topicResult[1].startswith("@topic"):
                    Util().sendMessage(channel, "Ignoring Duplicate request!")
                else:
                    newTopic = "<{0}> {1}".format(topicResult[0], topicResult[1])
                    db.execute("SELECT * FROM `Topics` WHERE topic = %s", [newTopic])
                    BotConstants.connection.commit()
                    topicCheck = db.fetchall()

                    if len(topicCheck) == 0:
                        db.execute("INSERT INTO `Topics` (topic) VALUES (%s)", [newTopic])
                        BotConstants.connection.commit()
                        Util().sendMessage(channel, "Added topic: {0}".format(newTopic))
                    else:
                        Util().sendMessage(channel, "The topic \"{0}\" already exists!".format(newTopic))
            else:
                raise Exception()
        except:
            Util().sendMessage(channel, "Invalid message index.")

    def updateTopic(self, args):
        db = BotConstants.database
        if args[0] == "up" or args[0] == "down":
            BotConstants.currentTopicID += 1 if args[0] == "up" else -1
            BotConstants.currentTopicID = 1 if BotConstants.currentTopicID > BotConstants.totalTopics or BotConstants.currentTopicID <= 0 else BotConstants.currentTopicID

            db.execute("SELECT topic FROM `Topics` WHERE id = %s", [BotConstants.currentTopicID])
            BotConstants.connection.commit()
            BotConstants.irc.send("TOPIC ##Ocelotworks {0}\r\n".format(db.fetchall()[0][0]))
        elif args[0] == "removecurrent" or args[0] == "removeindex":
            print "remove something"

    def updateTopicCounts(self, db):
        #renumber topic IDs just in case there's a break in the middle
        db.execute("SET @count = 0")
        db.execute("UPDATE `Topics` SET `Topics`.`id` = @count:= @count + 1")
        BotConstants.connection.commit()

        #get total topic count
        db.execute("SELECT COUNT(*) FROM `Topics`")
        BotConstants.connection.commit()
        BotConstants.totalTopics = db.fetchall()[0][0]

        #set autoincrement to keep going where topic index left off
        db.execute("ALTER TABLE `Topics` AUTO_INCREMENT = %s", [BotConstants.totalTopics + 1])