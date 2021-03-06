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
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
    };
    var translator = new BotIntentTranslator(client);
    translator.warnNoUsersToAdd({context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/I didn't see any names to add/);
  });
  
  it('must explain added users status', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
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
    expect(messages[0].channel).to.equal(context.channel);
    // don't need user handle for informational messages
    expect(messages[0].userId).to.equal(undefined);
    // test that message indicates users to add
    expect(messages[0].message).to.match(/I added/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informAddStatus({entities: entities2, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/already in my list/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informAddStatus({entities: entities3, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message indicates it doesn't know added users
    expect(messages[0].message).to.match(/I don't know who/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
  });
  
  it('must warn no users to remove', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
    };
    var translator = new BotIntentTranslator(client);
    translator.warnNoUsersToRemove({context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/I didn't see any names to remove/);
  });
  
  it('must explain removed users status', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
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
    expect(messages[0].channel).to.equal(context.channel);
    // don't need user handle for informational messages
    expect(messages[0].userId).to.equal(undefined);
    // test that message indicates users to add
    expect(messages[0].message).to.match(/I removed/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informRemoveStatus({entities: entities2, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(/isn't in my list/);
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
  });
  
  it('must warn when not enough users to pair', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
    };
    var emptyUserList = [];
    var singleUserList = ["@alice"];
    var twoUserList = ["@joe", "@bob"];
    var entities1 = {
      users: emptyUserList
    };
    var entities2 = {
      users: singleUserList
    };
    var entities3 = {
      users: twoUserList
    };
    
    var translator = new BotIntentTranslator(client);
    
    translator.warnNotEnoughUsersToPair({context: context, entities: entities1});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message contains user names
    expect(messages[0].message).to.match(/There are no users to pair/);
    messages = [];
    client.messageChannel.reset();
    
    translator.warnNotEnoughUsersToPair({context: context, entities: entities2});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message indicates no users
    expect(messages[0].message).to.match(/can't pair only one person/);
    messages = [];
    client.messageChannel.reset();
    
    translator.warnNotEnoughUsersToPair({context: context, entities: entities3});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(context.user);
    // test that message has only one user
    expect(messages[0].message).to.match(/You probably want to add more users though/);
    expect(messages[0].message).to.match(new RegExp(twoUserList.join(" - ")));
    
  });
  
  it('must list users', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
    };
    var userList = ["@joe", "@bob"];
    var emptyUserList = [];
    var singleUserList = ["@alice"];
    var entities1 = {
      users: userList
    };
    var entities2 = {
      users: emptyUserList
    };
    var entities3 = {
      users: singleUserList
    };
    
    var translator = new BotIntentTranslator(client);
    
    translator.informListStatus({context: context, entities: entities1});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message contains user names
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informListStatus({context: context, entities: entities2});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message indicates no users
    expect(messages[0].message).to.match(/I don't have any people in my list/);
    messages = [];
    client.messageChannel.reset();
    
    translator.informListStatus({context: context, entities: entities3});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message has only one user
    expect(messages[0].message).to.match(new RegExp(englishJoinList(singleUserList)));
    expect(messages[0].message).to.match(/only person in my list/);
  });
  
  it('must warn users when not enough people to pair', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
    };
    var userList = ["@joe", "@bob"];
    var emptyUserList = [];
    var singleUserList = ["@alice"];
    var entities1 = {
      users: userList
    };
    var entities2 = {
      users: emptyUserList
    };
    var entities3 = {
      users: singleUserList
    };
    
    var translator = new BotIntentTranslator(client);
    
    translator.informListStatus({context: context, entities: entities1});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message contains user names
    expect(messages[0].message).to.match(new RegExp(englishJoinList(userList)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informListStatus({context: context, entities: entities2});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message indicates no users
    expect(messages[0].message).to.match(/I don't have any people in my list/);
    messages = [];
    client.messageChannel.reset();
    
    translator.informListStatus({context: context, entities: entities3});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message has only one user
    expect(messages[0].message).to.match(new RegExp(englishJoinList(singleUserList)));
    expect(messages[0].message).to.match(/only person in my list/);
  });
  
   it('must message about new grouped users', function () {
    var messages = [];
    var client = {
      messageChannel: sinon.spy(function (message, channel, userId) {
        messages.push({message: message, channel: channel, userId: userId});
      })
    };
    var context = {
      user: "testUser",
      channel: "someChannel"
    };
    var userList = ["@joe", "@bob"];
    var emptyUserList = [];
    var singleUserList = ["@alice"];
    var entities = {
      groups: [["@joe, @alice", "@paula"], ["@dave", "@fatima"], ["@adam", "evelyn", "@guy"]]
    };
     
    var groupsString = entities.groups
      .map(function(x) {return x.join(" - ");})
      .join('\n');
     
    var translator = new BotIntentTranslator(client);
    
    translator.informGroupStatus({context: context, entities: entities});
    expect(client.messageChannel.calledOnce).to.be.true; 
    expect(messages[0].channel).to.equal(context.channel);
    expect(messages[0].userId).to.equal(undefined);
    // test that message contains user names
    expect(messages[0].message).to.match(/pairs/);
    expect(messages[0].message).to.match(new RegExp(groupsString));
  });
  
});