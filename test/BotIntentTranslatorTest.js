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
    var addUsersList1 = ["@joe", "@bob"];
    var addUsersList2 = ["@alice"];
    var entities1 = {
      unknownUsers: [],
      existingUsers: [],
      knownUsers: addUsersList1
    };
    var entities2 = {
      unknownUsers: [],
      existingUsers: [],
      knownUsers: addUsersList2
    };
    
    var translator = new BotIntentTranslator(client);
    
    translator.informAddStatus({entities: entities1, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    // test that message indicates users to add
    expect(messages[0].message).to.match(new RegExp(englishJoinList(entities1.knownUsers)));
    messages = [];
    client.messageChannel.reset();
    
    translator.informAddStatus({entities: entities2, context: context});
    expect(client.messageChannel.calledOnce).to.be.true;
    expect(messages[0].channelId).to.equal(context.request.channelId);
    // test that message indicates no names in message
    expect(messages[0].message).to.match(new RegExp(englishJoinList(entities2.knownUsers)));
    
  });
});