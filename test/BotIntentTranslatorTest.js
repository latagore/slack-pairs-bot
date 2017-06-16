/* jshint expr:true */
/* allow expr because of chai.expect */
var BotIntentTranslator = require('../core/BotIntentTranslator');
var expect = require('chai').expect;
var sinon = require('sinon');
var utils = require('../core/utils.js');
var englishJoinList = utils.englishJoinList;


describe('Bot intent translator', function () {
  it('must warn no users to add', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channelId, userId) {
        messages.push({message: message, channelId: channelId, userId: userId});
      })
    };
    var context = {
      request: {
        userHandle: "testUser",
        channelId: "someChannel"
      }
    };
    var translator = new BotIntentTranslator(client);
    translator.warnNoUsersToAdd({context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    
    expect(messages[0].channelId).to.equal(context.request.channelId);
    expect(messages[0].userId).to.equal(context.request.userHandle);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/I didn't see any names to add/);
  });
  
  it('must explain added users status', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channelId, userId) {
        messages.push({message: message, channelId: channelId, userId: userId});
      })
    };
    var context = {
      request: {
        userHandle: "testUser",
        channelId: "someChannel"
      }
    };
    var userList = ["@joe", "@bob"];
    var entities1 = {
      unknownUsers: [],
      existingUsers: [],
      knownUsers: userList
    };
    var entities2 = {
      unknownUsers: [],
      existingUsers: userList,
      knownUsers: []
    };
    var entities3 = {
      unknownUsers: userList,
      existingUsers: [],
      knownUsers: []
    };
    
    var translator = new BotIntentTranslator(client);
    
    translator.informAddStatus({entities: entities1, context: context});
    
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    // don't need user handle for informational messages
    expect(messages[0].userId).to.equal(undefined);
    // test that message indicates users to add
    expect(messages[0].message).to.match(/I added/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informAddStatus({entities: entities2, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    expect(messages[0].userId).to.equal(context.request.userHandle);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/already in my list/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informAddStatus({entities: entities3, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    expect(messages[0].userId).to.equal(context.request.userHandle);
    // test that message indicates it doesn't know added users
    expect(messages[0].message).to.match(/I don't know who/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
  });
  
  it('must warn no users to remove', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channelId, userId) {
        messages.push({message: message, channelId: channelId, userId: userId});
      })
    };
    var context = {
      request: {
        userHandle: "testUser",
        channelId: "someChannel"
      }
    };
    var translator = new BotIntentTranslator(client);
    translator.warnNoUsersToRemove({context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    
    expect(messages[0].channelId).to.equal(context.request.channelId);
    expect(messages[0].userId).to.equal(context.request.userHandle);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/I didn't see any names to remove/);
  });
  
  it('must explain removed users status', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channelId, userId) {
        messages.push({message: message, channelId: channelId, userId: userId});
      })
    };
    var context = {
      request: {
        userHandle: "testUser",
        channelId: "someChannel"
      }
    };
    var userList = ["@joe", "@bob"];
    var entities1 = {
      unknownUsers: [],
      removedUsers: userList
    };
    var entities2 = {
      unknownUsers: userList,
      removedUsers: [],
    };
    
    var translator = new BotIntentTranslator(client);
    
    translator.informRemoveStatus({entities: entities1, context: context});   
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    // don't need user handle for informational messages
    expect(messages[0].userId).to.equal(undefined);
    // test that message indicates users to add
    expect(messages[0].message).to.match(/I removed/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informRemoveStatus({entities: entities2, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    expect(messages[0].userId).to.equal(context.request.userHandle);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/isn't in my list/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
  });
});