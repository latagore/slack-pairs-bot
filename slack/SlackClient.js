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
      console.log('incoming message: ', message);
      var {intent, entities, isForBot} = this.intentInterpreter.interpret(message);
      if (isForBot) {
        var context = message;
        this.intentHandler.handleIntent(intent, entities, context)
        .then((action) => {
          if (action) {
            // execute the action by looking up the action as a property of the botIntentTranslator
            console.log('action: ', action);
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
    return new Promise((resolve, reject) => {
      this.db.collection('channels').update(
        { name: listId },
        { 
          $addToSet: {
            list: { $each: userIds }
          }
        },
        { upsert: true },
        function(err, result) {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
  
  removeUsersFromList(listId, userIds) {
    return new Promise((resolve, reject) => {

      this.db.collection('channels').update(
        { name: listId },
        { 
           $pullAll: { list: userIds }
        },
        { upsert: true },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
  
  getList(listId) {
    console.log("listId: ", listId);
    return new Promise((resolve, reject) => {
      // use findAndModify to insert a doc if it doesn't already exist
      this.db.collection('channels').findAndModify(
        {name: listId},
        [],
        {$setOnInsert: {list: []}},
        {
          new: true,
          upsert: true
        },
        (err, result) => {
          if (err) reject(err);
          console.log("findAndModify result: ", result);
          resolve(result.value.list);
        }
      );
    });
  }
  
}

module.exports = SlackClient;