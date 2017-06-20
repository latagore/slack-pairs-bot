const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const MongoClient = require("mongodb").MongoClient;
const promisifyAll = require('bluebird').promisifyAll;
const IntentInterpreter = require('../core/IntentInterpreter.js');
const IntentHandler = require('../core/IntentHandler.js');
const BotIntentTranslator = require('../core/BotIntentTranslator.js');

class SlackClient {
  constructor(rtm, web, db, rtmStartData) {
    this.rtm = promisifyAll(rtm);
    this.web = web;
    this.web.users = promisifyAll(this.web.users);
    this.db = db;
    this.rtmStartData = rtmStartData;
    
    const botName = this.rtmStartData.self.id;
    this.intentInterpreter = new IntentInterpreter(botName);
    this.intentHandler = new IntentHandler(this);
    this.botIntentTranslator = new BotIntentTranslator(this, botName);

    this.rtm.on(RTM_EVENTS.MESSAGE, (message) => {
      console.log(message);
      var {intent, entities, isForBot} = this.intentInterpreter.interpret(message);
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
  
  getAllUsers() {
    return this.web.users.listAsync(false);
  }
  
  addUsersToList(listId, userIds) {
    this.db.collection('lists').update(
      { listId: listId },
      { 
        $addToSet: {
          list: { $each: userIds }
        }
      },
      { upsert: true }
    );
  }
  
  removeUsersFromList(listId, userIds) {
    this.db.collection('lists').update(
      { listId: listId },
      { 
        list: { $pullAll: userIds }
      },
      { upsert: true }
    );
  }
  
  getList(listId) {
    return this.db.collection('lists').find({list: listId}).toArray();
  }
  
}

module.exports = SlackClient;