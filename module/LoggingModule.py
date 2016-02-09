from . import ModuleBase, Util
from constants import *
import random, time, math, re, traceback
from datetime import datetime

class LoggingModule(ModuleBase):
    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "Logging Module"

    def getCommands(self):
        return ["topic", "sentence", "seen", "count"]

    def checkAccessLevel(self, channel, args):
        return

    def tooltip(self, channel, args):
        if args["command"] == "sentence":
            Util.sendMessage(channel, "Usage: @sentence <word(s)> [-context #]")
        elif args["command"] == "seen":
            Util.sendMessage(channel, "Usage: @seen <nickname>")
        elif args["command"] == "count":
            Util.sendMessage(channel, "Usage: @count <word(s)>")

    @staticmethod
    def logger(channel, username, message, timestamp):
        channel = channel.rstrip()
        if channel not in BotConstants.tables:
            BotConstants().runQuery("CREATE TABLE IF NOT EXISTS `{0}` (ID int NOT NULL AUTO_INCREMENT, Time text,Username text,Message text, PRIMARY KEY (ID))".format(channel))

        BotConstants().runQuery("INSERT INTO `{0}` (`Time`, `Username`, `Message`) VALUES (%s, %s, %s)".format(channel), BotConstants.loggingDB, timestamp, username, message)

    def sentence(self, channel, args):
        if len(args) > 0:
            bCtx = 0
            fCtx = 0

            if "-context" in args:
                ctxArgsIndex = args.index("-context")
                try:
                    ctx = int(args[ctxArgsIndex + 1])
                    fCtx = math.ceil(ctx / 2)
                    bCtx = ctx - fCtx

                    args.pop(ctxArgsIndex + 1)
                    args.pop(args.index("-context"))
                except (ValueError, IndexError):
                    Util.sendMessage(channel, "Invalid context amount")
                    return


            searchTerm = " ".join(args)
            BotConstants().runQuery("SELECT * FROM `{0}` WHERE Message LIKE %s AND Message NOT LIKE '@sentence%%'".format(channel), "%{0}%".format(searchTerm))

            result = BotConstants.db.fetchall()
            if len(result) != 0:
                randomMessage = random.choice(result)
                query = """
                        (SELECT * FROM (SELECT * FROM `{0}` WHERE ID < %s ORDER BY ID DESC LIMIT %s) tmp ORDER BY tmp.ID ASC)
                        UNION ALL (SELECT * FROM `{0}` WHERE ID = %s)
                        UNION ALL (SELECT * FROM `{0}` WHERE ID > %s ORDER BY ID ASC LIMIT %s)""".format(channel)

                BotConstants().runQuery(query, randomMessage["ID"], bCtx, randomMessage["ID"], randomMessage["ID"], fCtx)
                result = BotConstants.db.fetchall()

                if len(result) != 0:
                    index = 0
                    for message in result:
                        messageString = message["Message"]
                        if index == bCtx:
                            search = re.compile(r"({0})".format(searchTerm), re.I)
                            messageString = search.sub("\x02\x034\\1\x03\x02", messageString)

                        Util.sendMessage(channel, "<{0}> {1}".format(message["Username"], messageString))
                        index += 1
            else:
                Util.sendMessage(channel, 'No messages containing "{0}"'.format(searchTerm))
        else:
            self.tooltip(channel, args = {"command": "sentence"})

    def count(self, channel, args):
        if len(args) > 0:
            searchString = " ".join(args)
            BotConstants().runQuery("SELECT COUNT(*) wordCount FROM `{0}` WHERE Message REGEXP %s".format(channel), "[[:<:]]{0}[[:>:]]".format(searchString))

            result = BotConstants.db.fetchall()
            Util.sendMessage(channel, "\x02\x034{0}\x03\x02 has been said {1} times in {2}".format(searchString, result[0]["wordCount"], channel))
        else:
            self.tooltip(channel, args = {"command": "seen"})

    def seen(self, channel, args):
        if len(args) > 0:
            BotConstants().runQuery("SELECT * FROM `{0}` WHERE Username = %s ORDER BY ID DESC LIMIT 1".format(channel), args[0])

            result = BotConstants.db.fetchall()
            if len(result) != 0:
                result = result[0]
                try:
                    messageTime = datetime.strptime(result["Time"], "%d %b, %H:%M:%S")
                except ValueError:
                    messageTime = datetime.strptime(result["Time"], "%d %b, %H:%M")

                now = datetime.strptime(time.strftime("%d %b, %H:%M:%S"), "%d %b, %H:%M:%S")
                timeDelta = now - messageTime

                Util.sendMessage(channel, "{0} was last seen at {1} ({2} ago) with the message: {3}".format(args[0], result["Time"], timeDelta, result["Message"]))
            else:
                Util.sendMessage(channel, 'User "{0}" has never been logged in this channel'.format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "seen"})

    def topic(self, channel, args):
        if len(args) >= 1:
            if args[0] == "up" or args[0] == "down" or args[0] == "removecurrent" or args[0] == "removeindex":
                self.updateTopic(channel, args)
                return
            else:
                index = args[0]
        else:
            index = 0

        try:
            #will throw exception if index isn't an int
            int(index)

            #continue on
            BotConstants().runQuery("SELECT Username, Message FROM `{0}` WHERE ID = (SELECT MAX(ID) - %s FROM `{0}`)".format(channel), index)
            topicResult = BotConstants.db.fetchall()

            if len(topicResult) > 0:
                topicResult = topicResult[0]
                if topicResult["Message"].startswith("@topic"):
                    Util.sendMessage(channel, "Ignoring Duplicate request!")
                else:
                    newTopic = "<{0}> {1}".format(topicResult["Username"], topicResult["Message"].encode("utf-8"))
                    BotConstants().runQuery("SELECT * FROM `Topics` WHERE topic = %s", newTopic)
                    topicCheck = BotConstants.db.fetchall()

                    if len(topicCheck) == 0:
                        BotConstants().runQuery("INSERT INTO `Topics` (topic) VALUES (%s)", newTopic)
                        Util.sendMessage(channel, "Added topic: {0}".format(newTopic))
                        self.updateTopicCounts()
                    else:
                        Util.sendMessage(channel, "The topic \"{0}\" already exists!".format(newTopic))
            else:
                raise Exception()
        except:
            Util.sendMessage(channel, "Invalid message index.")

    def updateTopic(self, channel, args):
        if args[0] == "up" or args[0] == "down":
            BotConstants.currentTopicID += 1 if args[0] == "up" else -1

            if BotConstants.currentTopicID > BotConstants.totalTopics:
                BotConstants.currentTopicID = 1
            elif BotConstants.currentTopicID <= 0:
                BotConstants.currentTopicID = BotConstants.totalTopics
            else:
                BotConstants.currentTopicID = BotConstants.currentTopicID

            BotConstants().runQuery("SELECT topic FROM `Topics` WHERE id = %s", BotConstants.currentTopicID)
            result = BotConstants.db.fetchall()

            BotConstants.irc.send("TOPIC {0} {1}\r\n".format(BotConstants.config["irc"]["topicChannel"], Util.u8(result[0]["topic"])))
        elif args[0] == "removecurrent" or args[0] == "removeindex":
            index = BotConstants.currentTopicID
            if args[0] == "removeindex":
                try:
                    index = abs(int(args[1]))

                    if index > BotConstants.totalTopics:
                        Util.sendMessage(channel, "Index out of range.")
                        return
                except ValueError:
                    Util.sendMessage(channel, "Invalid message index/id to remove.")
                except IndexError:
                    Util.sendMessage(channel, "You must provide the index/id of the topic to remove.")

            BotConstants().runQuery("SELECT topic FROM `Topics` WHERE id = %s", index)
            deletedTopic = BotConstants.db.fetchall()[0]["topic"]
            BotConstants().runQuery("DELETE FROM `Topics` WHERE id = %s", index)
            if index == BotConstants.currentTopicID:
                self.updateTopic(channel, ["up"])
            self.updateTopicCounts()
            BotConstants.currentTopicID -= 1
            Util.sendMessage(channel, "Deleted topic \"{0}\" successfully.".format(deletedTopic))

    @staticmethod
    def updateTopicCounts():
        #renumber topic IDs just in case there's a break in the middle
        BotConstants().runQuery("SET @count = 0")
        BotConstants().runQuery("UPDATE `Topics` SET `Topics`.`id` = @count:= @count + 1")

        #get total topic count
        BotConstants().runQuery("SELECT COUNT(*) AS topicCount FROM `Topics`")
        BotConstants.totalTopics = BotConstants.db.fetchall()[0]["topicCount"]

        #set autoincrement to keep going where topic index left off
        BotConstants().runQuery("ALTER TABLE `Topics` AUTO_INCREMENT = %s", BotConstants.totalTopics + 1)