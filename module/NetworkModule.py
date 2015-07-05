from . import ModuleBase, Util
from constants import AccessLevels
import subprocess
import re

class NetworkModule(ModuleBase):
    recordNames = {
        "A": "IPv4 Address",
        "AAAA": "IPv6 Address"
    }

    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "Network Module"

    def getCommands(self):
        return ["ping", "host"]

    def tooltip(self, channel, args):
        Util().sendMessage(channel, "Usage: @{0} <domain name>".format(args["command"]))

    def ping(self, channel, args):
        if len(args) >= 1:
            ping = subprocess.Popen(["ping", "-q", "-i 0.2", "-c 5", args[0]], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            (pingResponse, err) = ping.communicate()
            
            if not err.startswith("ping: unknown host"):
                pingRegex = re.compile(ur'(.*) packets transmitted, (.*) received, (.*%) packet loss.*\nrtt min\/avg\/max\/mdev = (.*)\/(.*)\/(.*)\/.* ms')
                pingResult = re.findall(pingRegex, pingResponse)[0]
                resultString = "Packets Received: {1}/{0} | Packet Loss: {2} | Min Ping: {3} ms | Max Ping: {4} ms | Average Ping: {5} ms"\
                    .format(pingResult[0], pingResult[1], pingResult[2], pingResult[3], pingResult[4], pingResult[5])
                Util().sendMessage(channel, resultString)
            else:
                Util().sendMessage(channel, "Unknown host \"{0}\"".format(args[0]))
        else:
            self.tooltip(channel, args = {"command": "ping"})

    def host(self, channel, args):
        if len(args) >= 1:
            procArgs = [
                "dig",
                "ANY",
                "+noadditional",
                "+nocomments",
                "+nocmd",
                "+nostats",
                args[0],
                "@8.8.8.8"
            ]

            ping = subprocess.Popen(procArgs, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            (pingResponse, err) = ping.communicate()
            
            response = pingResponse.decode("utf8").splitlines()
            message = ""
            for line in response:
                line = re.sub("\s+", " ", line)
                if line != ";{0}. IN ANY".format(args[0]) and not line.startswith("."):
                    line = line.split()[3:]
                    recordType = line[0]
                    if self.recordNames.has_key(recordType):
                        line = " ".join(line[1:])
                        message += "{0}: {1} || ".format(self.recordNames[recordType], line)

            message = message.rstrip(" || ")
            if message == "":
                Util().sendMessage(channel, "Bad hostname \"{0}\"".format(args[0]))
            else:
                Util().sendMessage(channel, message)
        else:
            self.tooltip(channel, args = {"command": "host"})