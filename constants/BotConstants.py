import socket
import ssl
import MySQLdb
import json

class BotConstants:
    ircSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    irc = ssl.wrap_socket(ircSocket)

    moduleCommands = {}

    with open("constants/bot.config") as file:
        config = json.loads(file.read().replace("\n", ""))

    connection = MySQLdb.connect(host=config["mysql"]["host"], user=config["mysql"]["user"], passwd=config["mysql"]["password"], db=config["mysql"]["database"])
    database = connection.cursor()

    currentTopicID = 1
    totalTopics = 0
    messageCount = 0

    def reconnect(self):
        config = self.config
        self.connection = MySQLdb.connect(host=config["mysql"]["host"], user=config["mysql"]["user"], passwd=config["mysql"]["password"], db=config["mysql"]["database"])
        self.database = self.connection.cursor()