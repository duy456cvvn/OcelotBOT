import rethinkdb as r
import pymysql.cursors
import json
from tqdm import tqdm

config = json.loads(open('config.json', 'rb').read().replace('\n', ''))

dbUser = config['database']['user']
dbPass = config['database']['password']

r.connect(host='localhost', db='ocelotbot', user=dbUser, password=dbPass).repl()
connection = pymysql.connect(host=config['database']['host'], 
                             user=dbUser,
                             password=dbPass,
                             db='stevie',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)
connection.autocommit(True)


print 'Retrieving topics from rethinkDB...'
topics = list(r.table('topics').run())
with connection.cursor() as db:
    print 'Inserting topics into MySQL...'
    for t in tqdm(topics):
        db.execute('INSERT INTO Topics (username, topic) VALUES (%s, %s)', (t['username'], t['topic']))



print 'Retrieving messages from rethinkDB...'
messages = list(r.table('messages').run())

nonIDMessages = []
idMessages = []

print 'Sorting messages by sequential ID and random ID...'
for msg in messages:
    if isinstance(msg['id'], int):
        idMessages.append(msg)
    else:
        nonIDMessages.append(msg)

print 'Sorting lists by ID and time...'
idMessages = sorted(idMessages, key=lambda x: x['id'])
nonIDMessages = sorted(nonIDMessages, key=lambda x: x['time'])

with connection.cursor() as db:
    print 'Inserting sequential ID messages into MySQL...'
    for msg in tqdm(idMessages):
        db.execute('INSERT INTO Messages (channel, user, message, time) VALUES (%s, %s, %s, %s)', (msg['channel'], msg['user'], msg['message'], msg['time']))

    print 'Inserting random ID messages into MySQL...'
    for msg in tqdm(nonIDMessages):
        db.execute('INSERT INTO Messages (channel, user, message, time) VALUES (%s, %s, %s, %s)', (msg['channel'], msg['user'], msg['message'], msg['time']))

print 'Done!'