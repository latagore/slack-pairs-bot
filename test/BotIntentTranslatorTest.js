/* jshint expr:true */
/* allow expr because of chai.expect */
var BotIntentTranslator = require('../core/BotIntentTranslator');
var expect = require('chai').expect;
var sinon = require('sinon');

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
});