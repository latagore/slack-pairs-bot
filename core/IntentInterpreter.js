const startsWith = require('underscore.string/startsWith');

class IntentInterpreter {
  constructor(selfId) {
    // FIXME hardcoded for slack messages...
    this.selfId = `<@${selfId}>`;
  }
  
  interpret(message) {
    let intent;
    let entities;

    message = message.trim();
    if (startsWith(message, this.selfId)) {
      message = message.replace(new RegExp(this.selfId + "\\s+"), '');
    } else {
      return { isForBot: false };
    }

    if (startsWith(message, "add")) {
      intent = "addUserCommand";
      const users = message.replace(/add\s+((user(s)?|people)\s+)?/, '').split(/\s+/);
      entities = { users };
    } else if (startsWith(message, "remove")) {
      intent = "removeUserCommand";
      const users = message.replace(/remove\s+((user(s)?|people)\s+)?/, '').split(/\s+/);
      entities = { users };
    } else if (startsWith(message, "list")) {
      intent = "listUsersCommand";
      entities = {};
    } else if (startsWith(message, "pair")) {
      intent = "pairUsersCommand";
      entities = {};
    }

    // returns {intent, entities}
    return {intent, entities, isForBot: true};
  }
}
module.exports = IntentInterpreter;