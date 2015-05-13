from . import ModuleBase, Util, UtilityModule
from constants import *
import warnings
import MySQLdb

class LoggingModule(ModuleBase):
    def accessLevel(self):
        return AccessLevels.ADMIN

    def moduleName(self):
        return "Logging Module"

    def getCommands(self):
        return ["topic"]

    def tooltip(self, channel, args):
        Util().sendMessage(channel, "How did you even get this to happen")

    def logger(self, channel, username, message, time):
        db = BotConstants.database
        channel = channel.rstrip()
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                db.execute("CREATE TABLE IF NOT EXISTS `{0}` (ID int NOT NULL AUTO_INCREMENT, Time text,Username text,Message text, PRIMARY KEY (ID))".format(channel))
            BotConstants.connection.commit()
            db.execute("INSERT INTO `{0}` (`Time`, `Username`, `Message`) VALUES (%s, %s, %s)".format(channel), [time, username, message])
            BotConstants.connection.commit()
        except MySQLdb.OperationalError:
            BotConstants().reconnect()
            self.logger(channel, username, message, time)
            
    def checkAccessLevel(self, channel, args):
        return

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