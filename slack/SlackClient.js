const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const promisifyAll = require('bluebird').promisifyAll;
const IntentInterpreter = require('../core/IntentInterpreter.js');
const IntentHandler = require('../core/IntentHandler.js');
const BotIntentTranslator = require('../core/BotIntentTranslator.js');

class SlackClient {
  constructor(rtc, web) {
    this.rtc = promisifyAll(rtc);
    this.web = promisifyAll(web);
    
    this.interpret = IntentInterpreter;
    this.intentHandler = new IntentHandler(this);
    this.botIntentTranslator = new BotIntentTranslator(this);
    
    this.rtm.start();

    this.rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      var {intent, entities, isForBot} = this.interpret(message);
      if (isForBot) {
        var context = message;
        this.intentHandler.handleIntent({intent, entities}, message)
        .then((action) => {
          if (action) {
            // execute the action by looking up the action as a property of the botIntentTranslator
            this.botIntentTranslator[action]();
          } else {
            console.warn("shouldn't we have an action for this?");
          }
        }).catch(() => {
          console.error(new Error("something went wrong"));
        });
      }
    });
  }
  
  messageChannel(message, channelId, recipientHandle) {
    const fullMessage = `@${recipientHandle} ${message} `;
    this.rtm.sendMessage(fullMessage, channelId);
  }
  
  getUsers() {
    return this.web.users.listAsync(false);
  }
}

module.exports = SlackClient;