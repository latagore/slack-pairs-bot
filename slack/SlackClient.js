const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const promisifyAll = require('bluebird').promisifyAll;
const IntentInterpreter = require('../core/IntentInterpreter.js');
const IntentHandler = require('../core/IntentHandler.js');
const BotIntentTranslator = require('../core/BotIntentTranslator.js');

class SlackClient {
  constructor(rtm, web, rtmStartData) {
    this.rtm = promisifyAll(rtm);
    this.web = web;
    this.web.users = promisifyAll(this.web.users);
    this.rtmStartData = rtmStartData;
    
    const botName = this.rtmStartData.self.id;
    this.intentInterpreter = new IntentInterpreter(botName);
    this.intentHandler = new IntentHandler(this);
    this.botIntentTranslator = new BotIntentTranslator(this, botName);

    this.rtm.on(RTM_EVENTS.MESSAGE, (message) => {
      var {intent, entities, isForBot} = this.intentInterpreter.interpret(message);
      console.log(message);
      if (isForBot) {
        var context = message;
        this.intentHandler.handleIntent(intent, entities, context)
        .then((action) => {
          if (action) {
            // execute the action by looking up the action as a property of the botIntentTranslator
            console.log(action);
            this.botIntentTranslator[action.intent]({entities: action.entities, context});
          } else {
            console.warn("shouldn't we have an action for this?");
          }
        }).catch((e) => {
          console.error("something went wrong:", e);
          this.botIntentTranslator.exceptionThrown(context);
        });
      }
    });
  }
  
  messageChannel(message, channelId, recipientHandle) {
    if (recipientHandle) {
      const fullMessage = `<@${recipientHandle}> ${message} `;
      this.rtm.sendMessage(fullMessage, channelId);
    } else {
      this.rtm.sendMessage(message, channelId);
    }
  }
  
  getUsers() {
    return this.web.users.listAsync(false);
  }
  
}

module.exports = SlackClient;