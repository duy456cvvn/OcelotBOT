from . import ModuleBase, Util
from constants import *
import urllib2
import json

#utility module for defining words
class DictionaryModule(ModuleBase):
    def accessLevel(self, commandName):
        return AccessLevels.USER

    def moduleName(self):
        return "Dictionary Module"

    def getCommands(self):
        return ["define", "defineud"]

    def define(self, channel, args):
        if len(args) >= 1:
            self.wordToDefine = " ".join(args)
            self.wordToDefine = urllib2.quote(self.wordToDefine)
            definitionJSON = urllib2.urlopen("http://api.wordnik.com:80/v4/word.json/{0}/definitions?limit=1&includeRelated=true&useCanonical=true&includeTags=false&api_key=0e73155eb6a8493af441503d98e0bdd1d2f36bf63a22d5c12".format(self.wordToDefine)).read()
            definitionJSON = json.loads(definitionJSON)
            if len(definitionJSON) != 0:
                definitionJSON = definitionJSON[0]

                word = definitionJSON["word"]
                definition = definitionJSON["text"]
                partOfSpeech = " ({0})".format(definitionJSON["partOfSpeech"]) if "partOfSpeech" in definitionJSON else ""
                Util().sendMessage(channel, "{0}{1}: {2}".format(word, partOfSpeech, definition))
            else:
                Util().sendMessage(channel, "No standard definition found for \"{0}\". Please check Urban Dictionary with @defineud".format(urllib2.unquote(self.wordToDefine)))
        else:
            self.tooltip(channel, args = {"command": "define"})

    def defineud(self, channel, args):
        if len(args) >= 1:
            self.wordToDefine = " ".join(args)
            self.wordToDefine = urllib2.quote(self.wordToDefine)
            definitionJSON = urllib2.urlopen("http://api.urbandictionary.com/v0/define?term={0}".format(self.wordToDefine)).read()
            definitionJSON = json.loads(definitionJSON)
            if definitionJSON["result_type"] != "no_results":
                definitionJSON = definitionJSON["list"][0]

                word = definitionJSON["word"]
                definition = definitionJSON["definition"]
                Util().sendMessage(channel, "%s: %s" % (word, definition))
            else:
                Util().sendMessage(channel, "No urban dictionary definition found for \"{0}\". Wow.".format(urllib2.unquote(self.wordToDefine)))
        else:
            self.tooltip(channel, args = {"command": "defineud"})

    def tooltip(self, channel, args):
        Util().sendMessage(channel, "Usage: @{0} <word(s)>".format(args["command"]))