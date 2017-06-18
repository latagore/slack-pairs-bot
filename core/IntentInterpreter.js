const startsWith = require('underscore.string/startsWith');

class IntentInterpreter {
  constructor(selfId) {
    this.selfId = selfId;
    // FIXME hardcoded for slack messages...
    this.selfIdText = `<@${selfId}>`;
  }
  
  interpret(message) {
    let intent;
    let entities;
    if (message.type === 'message' &&
        message.subtype === 'channel_join' &&
        message.user === this.selfId) {
      intent = 'invite';
      entities = {};
    } else if (message.type === 'message') {
      let messageText = message.text.trim();
      if (startsWith(messageText, this.selfIdText)) {
        messageText = messageText.replace(new RegExp(this.selfIdText + "\\s+"), '');
      } else {
        return { isForBot: false };
      }

      if (startsWith(messageText, "add")) {
        intent = "addUserCommand";
        const users = messageText.replace(/add\s+((user(s)?|people)\s+)?/, '').split(/\s+/);
        entities = { users };
      } else if (startsWith(messageText, "remove")) {
        intent = "removeUserCommand";
        const users = messageText.replace(/remove\s+((user(s)?|people)\s+)?/, '').split(/\s+/);
        entities = { users };
      } else if (startsWith(messageText, "list")) {
        intent = "listUsersCommand";
        entities = {};
      } else if (startsWith(messageText, "pair")) {
        intent = "pairUsersCommand";
        entities = {};
      } else if (messageText.match(/\b(hi|hello)\b/i)) {
        intent = "greeting";
        entities = {};
      } else if (messageText.match(/\b(help)\b/i)) {
        intent = "help";
        entities = {};
      } else {
        intent = "unknown";
        entities = {};
      }
    }
    // returns {intent, entities}
    return {intent, entities, isForBot: true};
  }
}
module.exports = IntentInterpreter;