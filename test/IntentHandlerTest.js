/* jshint expr:true */
/* allow expr because of chai.expect */
var IntentHandler = require('../core/IntentHandler.js');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('intent handlers', function() {
  it('must add multiple users by user id', function() {
    var client = {
      getUsers: 
        sinon.stub().returns(Promise.resolve({
          ok: true,
          members: [
            { name: "joe" },
            { name: "bob" },
            { name: "alice" },
          ]
        })),
      messageChannel: sinon.spy()  
    };
    
    var addUsersList1 = ["joe", "bob"];
    var addUsersList2 = ["alice"];
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    
    expect(client.getUsers.called).to.be.false;
    expect(client.messageChannel.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList1 },
      { channel: channel }
    ).then(function () {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal(addUsersList1);
      
      client.getUsers.resetHistory();
      client.messageChannel.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList2 },
        { channel: channel }
      );
    }).then(function () {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel]))
        .to.be.deep.equal(addUsersList1.concat(addUsersList2));
    });
  });
  
  it('must ignore duplicates', function() {
    var client = {
      getUsers: 
        sinon.stub().returns(Promise.resolve({
          ok: true,
          members: [
            { name: "joe" },
            { name: "bob" },
            { name: "alice" },
          ]
        })),
      messageChannel: sinon.spy()  
    };
    
    var addUsersList = ["joe", "joe"];
    var uniqueList = Array.from(new Set(addUsersList));
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    
    expect(client.getUsers.called).to.be.false;
    expect(client.messageChannel.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList },
      { channel: channel }
    ).then(function () {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal(uniqueList);
      expect(Array.from(ih.list[channel])).to.be.not.deep.equal(addUsersList);
      
      client.getUsers.resetHistory();
      client.messageChannel.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList },
        { channel: channel }
      );
    }).then(function () {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal(uniqueList);
    });
  });
});