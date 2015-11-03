from abc import ABCMeta, abstractmethod
from constants import *

#abstract ModuleBase class using abc package. all modules base off this one
class ModuleBase(object):
    __metaclass__ = ABCMeta

    #sets access level for module
    @abstractmethod
    def accessLevel(self, commandName):
        return

    #sets the name of the module
    @abstractmethod
    def moduleName(self):
        return

    #sets the commands callable in the module
    @abstractmethod
    def getCommands(self):
        return

    #sets the help message
    @abstractmethod
    def tooltip(self, channel, args):
        return

#Util class
class Util:
    @staticmethod
    def u8(t):
        return t.encode("UTF-8", "replace") if isinstance(t, unicode) else t

    def sendMessage(self, channel, message):
        BotConstants.irc.send("PRIVMSG {0} :{1}\r\n".format(channel, self.u8(message)))