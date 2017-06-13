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
      messageChannel: sinon.spy(console.log)  
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
      messageChannel: sinon.spy(console.log)  
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
  
  it('must accept no users to add', function() {
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
      messageChannel: sinon.spy(console.log)  
    };
    
    var addUsersList = ["joe"];
    var emptyUsersList = [];
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    
    expect(client.getUsers.called).to.be.false;
    expect(client.messageChannel.called).to.be.false;
    
    return ih.handleIntent(
        "addUserCommand",
        { users: emptyUsersList },
        { channel: channel }
    ).then(function () {
      expect(client.getUsers.called).to.be.false;
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal(emptyUsersList);
      
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
      expect(Array.from(ih.list[channel])).to.be.deep.equal(addUsersList);
      
      client.getUsers.resetHistory();
      client.messageChannel.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: emptyUsersList },
        { channel: channel }
      );
    }).then(function () {
      expect(client.getUsers.called).to.be.false;
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal(addUsersList);
    });
  });
  
  it('must remove users', function() {
    var client = {
      messageChannel: sinon.spy(console.log)  
    };
    
    var addUsersList1 = ["joe", "bob"];
    var addUsersList2 = ["alice"];
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    ih.list[channel] = new Set(["joe", "bob", "alice"]);
    
    
    expect(client.messageChannel.called).to.be.false;
    
    return ih.handleIntent(
      "removeUserCommand",
      { users: addUsersList1 },
      { channel: channel }
    ).then(function () {
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal(["alice"]);
      
      client.messageChannel.reset();
    }).then(function () {
      return ih.handleIntent(
        "removeUserCommand",
        { users: addUsersList2 },
        { channel: channel }
      );
    }).then(function () {
      expect(client.messageChannel.called).to.be.true;
      expect(Array.from(ih.list[channel])).to.be.deep.equal([]);
    });
  });
  
  it('must accept removing users from an empty channel gracefully');
  
  it('must list users', function () {
    var client = {
      messageChannel: sinon.spy(console.log)  
    };
    
    var channel = 'someChannel';
    var ih = new IntentHandler(client);
    ih.list[channel] = new Set(["joe", "bob", "alice"]);
    
    return ih.handleIntent(
      "listUsersCommand",
      {},
      { channel: channel }
    ).then(function () {
      expect(client.messageChannel.calledOnce).to.be.true;
      // TODO need to revisit this...
      // doesn't really do anything
    });
  });
  
  it('must pair users', function () {
    var client = {
      messageChannel: sinon.spy(console.log)  
    };
    
    var channel = 'someChannel';
    var ih = new IntentHandler(client);
    ih.list[channel] = new Set(["joe", "bob", "alice", "karen", "ali", "fatima", "lee"]);
    
    return ih.handleIntent(
      "pairUsersCommand",
      {},
      { channel: channel }
    ).then(function () {
      expect(client.messageChannel.calledOnce).to.be.true;
      // TODO need to revisit this...
      // doesn't really do anything
    });
  });
  
  it('must separate @real_users and names', function () {
    var client = {
      getUsers: 
        sinon.stub().returns(Promise.resolve({
          ok: true,
          members: [
            { name: "@joe" },
            { name: "@bob" },
            { name: "@alice" },
          ]
        })),
      messageChannel: sinon.spy(console.log)  
    };
    
    var addUsersList1 = ["@joe", "@bob"];
    var addUsersList2 = ["alice", "@alice"];
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
      expect(ih.list[channel])
        .to.be.deep.equal(new Set(addUsersList1.concat(addUsersList2)));
    });
  });
});