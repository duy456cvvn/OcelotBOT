import socket, ssl, json, MySQLdb, MySQLdb.cursors

class BotConstants:
    ircSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    irc = ssl.wrap_socket(ircSocket)

    moduleCommands = {}

    with open("constants/bot.config") as file:
        config = json.loads(file.read().replace("\n", ""))

    connection = MySQLdb.connect(host           = config["mysql"]["host"],
                                 user           = config["mysql"]["user"],
                                 passwd         = config["mysql"]["password"],
                                 db             = config["mysql"]["database"],
                                 use_unicode    = True,
                                 charset        = "utf8mb4",
                                 cursorclass    = MySQLdb.cursors.DictCursor)
    db = connection.cursor()
    connection.autocommit(True)

    tables = []
    currentTopicID = 1
    totalTopics = 0
    messageCount = 0

    db.execute("SELECT table_name AS tableName FROM information_schema.tables WHERE table_schema = database()")
    result = db.fetchall()
    for table in result:
        tables.append(table["tableName"])

    def runQuery(self, query, *args):
        argList = [a for a in args]
        try:
            self.db.execute(query, argList)
        except MySQLdb.OperationalError:
            self.connection.ping(True)
            self.db.execute(query, argList)