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
        }))
    };
    
    var addUsersList1 = ["@joe", "@bob"];
    var addUsersList2 = ["@alice"];
    var expectedAction1 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: [],
        existingUsers: [],
        knownUsers: addUsersList1
      }
    };
    var expectedAction2 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: [],
        existingUsers: [],
        knownUsers: addUsersList2
      }
    };
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    expect(client.getUsers.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList1 },
      { channel: channel }
    ).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction1);
      
      client.getUsers.resetHistory();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList2 },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
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
        }))
    };
    
    var addUsersList = ["@joe", "@joe"];
    var uniqueList = Array.from(new Set(addUsersList));
    var expectedAction1 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: [],
        existingUsers: [],
        knownUsers: uniqueList
      }
    };
    var expectedAction2 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: [],
        existingUsers: uniqueList,
        knownUsers: []
      }
    };
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    
    expect(client.getUsers.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList },
      { channel: channel }
    ).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction1);
      
      client.getUsers.resetHistory();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
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
        }))
    };
    
    var addUsersList = ["@joe"];
    var emptyUsersList = [];
    var expectedAction1 = {
      intent: "warnNoUsersToAdd"
    };
    var expectedAction2 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: [],
        existingUsers: [],
        knownUsers: addUsersList
      }
    };
    var expectedAction3 = {
      intent: "warnNoUsersToAdd"
    };
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    
    expect(client.getUsers.called).to.be.false;
    
    return ih.handleIntent(
        "addUserCommand",
        { users: emptyUsersList },
        { channel: channel }
    ).then(function (action) {
      expect(client.getUsers.called).to.be.false;
      expect(action).to.be.deep.equal(expectedAction1);
      
      client.getUsers.resetHistory();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
      
      client.getUsers.resetHistory();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: emptyUsersList },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getUsers.called).to.be.false;
      expect(action).to.be.deep.equal(expectedAction3);
    });
  });
  
  it('must remove users', function() {
    var client = {};
    
    var removeUsersList1 = ["@joe", "@bob"];
    var removeUsersList2 = ["@alice"];
    
    var expectedAction1 = {
      intent: "informRemoveStatus",
      entities: {
        unknownUsers: [],
        removedUsers: removeUsersList1
      }
    };
    var expectedAction2 = {
      intent: "informRemoveStatus",
      entities: {
        unknownUsers: [],
        removedUsers: removeUsersList2
      }
    };
    
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    ih.list[channel] = new Set(["@joe", "@bob", "@alice"]);
    
      
    return ih.handleIntent(
      "removeUserCommand",
      { users: removeUsersList1 },
      { channel: channel }
    ).then(function (action) {
      expect(action).to.be.deep.equal(expectedAction1);
    }).then(function () {
      return ih.handleIntent(
        "removeUserCommand",
        { users: removeUsersList2 },
        { channel: channel }
      );
    }).then(function (action) {
      expect(action).to.be.deep.equal(expectedAction2);
    });
  });
  
  it('must accept removing users from an empty channel gracefully');
  
  it('must list users', function () {
    var client = {};
    
    var users = ["@joe", "@bob", "@alice"];
    var expectedAction = {
      intent: "informListStatus",
      entities: {
        users: users
      }
    };
    var channel = 'someChannel';
    var ih = new IntentHandler(client);
    ih.list[channel] = new Set(users);
    
    return ih.handleIntent(
      "listUsersCommand",
      {},
      { channel: channel }
    ).then(function (action) {
      expect(action).to.be.deep.equal(expectedAction);
    });
  });
  
  it('must pair users', function () {
    var client = {};
    
    var users = ["@joe", "@bob", "@alice", "@karen", "@ali", "@fatima", "@lee"];
    var channel = 'someChannel';
    var ih = new IntentHandler(client);
    ih.list[channel] = new Set(users);
    
    return ih.handleIntent(
      "pairUsersCommand",
      {},
      { channel: channel }
    ).then(function (action) {
      expect(action.intent).to.be.equal('informPairStatus');
      var groups = action.entities.groups;
      var usersInGroups = groups.reduce(function (list, group) {
        return list.concat(group);
      }, []);
      
      expect(usersInGroups.sort()).to.be.deep.equal(users.sort());
    });
  });
  
  it('must separate @real_users and names', function () {
    var client = {
      getUsers: 
        sinon.stub().returns(Promise.resolve({
          ok: true,
          members: [
            { name: "joe" },
            { name: "bob" },
            { name: "alice" }
          ]
        }))
    };
    
    var addUsersList1 = ["@joe", "@bob"];
    var addUsersList2 = ["alice", "@alice"];
    var expectedAction1 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: [],
        existingUsers: [],
        knownUsers: addUsersList1
      }
    };
    var expectedAction2 = {
      intent: "informAddStatus",
      entities: {
        unknownUsers: ["alice"],
        existingUsers: [],
        knownUsers: ["@alice"]
      }
    };    
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    expect(client.getUsers.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList1 },
      { channel: channel }
    ).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      
       expect(action).to.be.deep.equal(expectedAction1);
      
      client.getUsers.resetHistory();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList2 },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
    });
  });
});