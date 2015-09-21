from . import ModuleBase, Util
from constants import *
from threading import Thread, Event
import requests, socket

class MinecraftModule(ModuleBase):
	def __init__(self):
		self.statuses = {
			"skin": "",
			"auth": "",
			"session": ""
		}
		self.gameStatus = None
		self.checkMojangServers()

	def accessLevel(self, commandName):
		return AccessLevels.USER

	def moduleName(self):
		return "Minecraft Module"

	def getCommands(self):
		return ["mcstatus"]

	def tooltip(self, channel, args):
		return

	def parseStatus(self, s):
		return "\x033Online\x03" if s == "green" else "\x038Experiencing Problems\x03" if s == "yellow" else "\x034Offline\x03" if s == "red" else "\x0315Unknown\x03"

	def checkMojangServers(self):
		checkThread = StatusCheckThread(self)
		checkThread.daemon = True
		checkThread.start()

		checkThread = FTBStatusCheckThread(self)
		checkThread.daemon = True
		checkThread.start()

	def mcstatus(self, channel, args):
		skinStatus, authStatus, sessionStatus = map(self.parseStatus, [self.statuses["skin"], self.statuses["auth"], self.statuses["session"]])
		ftbStatus = "\x033Online\x03" if self.gameStatus else "\x034Offline\x03" if self.gameStatus == False else "\x0315Unknown\x03"
		statusMessage = "Mojang Server Status: [Skins: {0}] | [Auth: {1}] | [Session: {2}]  ||  FTB Server Status: [{3}]".format(skinStatus, authStatus, sessionStatus, ftbStatus)
		Util().sendMessage(channel, statusMessage)

class StatusCheckThread(Thread):
	def __init__(self, parent):
		Thread.__init__(self)
		self.stopFlag = Event()
		self.parent = parent

		self.outChan = BotConstants().config["mc"]["outputChannel"]

	def run(self):
		self.check()
		while not self.stopFlag.wait(300):
			self.check()

	def check(self):
		res = requests.get("http://status.mojang.com/check")
		if res.status_code == 200:
			try:
				rJSON = res.json()
				servers = {}
				for server in rJSON:
					server = server.items()[0]
					servers[server[0]] = server[1]

				skinStatus, authStatus, sessionStatus = servers["skins.minecraft.net"], servers["auth.mojang.com"], servers["session.minecraft.net"]
				currSkin, currAuth, currSession = self.parent.statuses["skin"], self.parent.statuses["auth"], self.parent.statuses["session"]
				if skinStatus != currSkin and currSkin != "": Util().sendMessage("##ftbwanders", "Skin Server Status Change: {0}".format(self.parent.parseStatus(skinStatus)))
				if authStatus != currAuth and currAuth != "": Util().sendMessage("##ftbwanders", "Auth Server Status Change: {0}".format(self.parent.parseStatus(authStatus)))
				if sessionStatus != currSession and currSession != "": Util().sendMessage(self.outChan, "Session Server Status Change: {0}".format(self.parent.parseStatus(sessionStatus)))
				self.parent.statuses["skin"], self.parent.statuses["auth"], self.parent.statuses["session"] = skinStatus, authStatus, sessionStatus
			except:
				pass

class FTBStatusCheckThread(Thread):
	def __init__(self, parent):
		Thread.__init__(self)
		self.stopFlag = Event()
		self.parent = parent

		self.sock = None
		self.host = BotConstants().config["mc"]["host"]
		self.port = BotConstants().config["mc"]["port"]
		self.outChan = BotConstants().config["mc"]["outputChannel"]

	def run(self):
		self.check()
		while not self.stopFlag.wait(10):
			self.check()

	def check(self):
		try:
			self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
			self.sock.settimeout(5)
			self.sock.connect((self.host, self.port))

			self.sock.send("\xfe")
			data = self.sock.recv(2048)
			info = data.replace("\x00", "")[2:].split("\xa7")

			if not self.parent.gameStatus and self.parent.gameStatus is not None: Util().sendMessage(self.outChan, "FTB Server Status Change: [\x033Online\x03]")
			self.parent.gameStatus = True

			self.sock.close()
		except socket.error:
			if self.parent.gameStatus is not None and self.parent.gameStatus == True: Util().sendMessage(self.outChan, "FTB Server Status Change: [\x034Offline\x03]")
			self.parent.gameStatus = False