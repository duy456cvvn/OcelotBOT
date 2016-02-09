import socket, ssl, json, pymysql

class BotConstants:
    ircSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    irc = ssl.wrap_socket(ircSocket)

    moduleCommands = {}

    with open("constants/bot.config") as file:
        config = json.loads(file.read().replace("\n", ""))

    getDBConnection = lambda c: pymysql.connect(host           = c["mysql"]["host"],
                                                user           = c["mysql"]["user"],
                                                passwd         = c["mysql"]["password"],
                                                db             = c["mysql"]["database"],
                                                use_unicode    = True,
                                                charset        = "utf8mb4",
                                                autocommit     = True,
                                                cursorclass    = pymysql.cursors.DictCursor)
    connection = getDBConnection(config)
    db = connection.cursor()

    loggingConnection = getDBConnection(config)
    loggingDB = loggingConnection.cursor()

    tables = []
    currentTopicID = 1
    totalTopics = 0
    messageCount = 0

    db.execute("SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = database()")
    result = db.fetchall()
    for table in result:
        tables.append(table["tableName"])

    db.execute("SELECT val FROM `BotVars` WHERE name = 'autoTopicCount'")
    result = db.fetchall()
    if len(result) > 0:
        messageCount = int(result[0]["val"])

    def runQuery(self, query, database = None, *args):
        argList = [a for a in args]

        if database is None:
            database = self.db
        elif type(database) is not pymysql.cursors.DictCursor:
            argList.insert(0, database)
            database = self.db

        try:
            print "Running Query: {0}".format(database.mogrify(query, argList))
            database.execute(query, argList)
        except pymysql.OperationalError:
            database.connection.ping(True)
            database.execute(query, argList)