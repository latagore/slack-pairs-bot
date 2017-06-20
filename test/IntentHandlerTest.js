/* jshint expr:true */
/* allow expr because of chai.expect */
var IntentHandler = require('../core/IntentHandler.js');
var expect = require('chai').expect;
var sinon = require('sinon');

var clientList;
var client = {
  getAllUsers: 
    sinon.stub().returns(Promise.resolve({
      ok: true,
      members: [
        { name: "joe", id: "uid1" },
        { name: "bob", id: "uid2" },
        { name: "alice", id: "uid3" }
      ]
    })),
  getList: 
    sinon.spy(function () {
      return Array.from(clientList);
    }),
  addUsersToList:
    sinon.spy(function (users) {
      users.forEach(function(u) {
        clientList.add(u);
      });
    }),
  removeUsersFromList:
    sinon.spy(function (users) {
      users.forEach(function(u) {
        clientList.delete(u);
      });
    }),
};

beforeEach(function () {
  clientList = new Set();
  client.getAllUsers.resetHistory();
  client.getList.reset();
  client.addUsersToList.reset();
  client.removeUsersFromList.reset();
});


describe('intent handlers', function() {

  it('must add multiple users by user id', function() {
    var addUsersList1 = ["<@uid1>", "<@uid2>"];
    var addUsersList2 = ["<@uid3>"];
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
    
    expect(client.getAllUsers.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList1 },
      { channel: channel }
    ).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      expect(client.addUsersToList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction1);
      expect(Array.from(clientList)).to.be.deep.equal(addUsersList1);
      
      client.getAllUsers.resetHistory();
      client.addUsersToList.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList2 },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      expect(client.addUsersToList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
      expect(Array.from(clientList)).to.be.deep
        .equal(addUsersList1.concat(addUsersList2));
    });
  });
  
  it('must ignore duplicates', function() {
    var addUsersList = ["<@uid1>", "<@uid2>"];
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
    
    
    expect(client.getAllUsers.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList },
      { channel: channel }
    ).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      expect(client.addUsersToList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction1);
      expect(Array.from(clientList)).to.be.deep.equal(uniqueList);

      client.getAllUsers.resetHistory();
      client.addUsersToList.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
      expect(Array.from(clientList)).to.be.deep.equal(uniqueList);
    });
  });
  
  it('must accept no users to add', function() {
    var addUsersList = ["<@uid1>"];
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
    
    
    expect(client.getAllUsers.called).to.be.false;
    
    return ih.handleIntent(
        "addUserCommand",
        { users: emptyUsersList },
        { channel: channel }
    ).then(function (action) {
      expect(client.getAllUsers.called).to.be.false;
      expect(client.addUsersToList.called).to.be.false;
      expect(action).to.be.deep.equal(expectedAction1);
      expect(Array.from(clientList)).to.be.deep.equal(emptyUsersList);
      
      client.getAllUsers.resetHistory();
      client.addUsersToList.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      expect(client.addUsersToList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
      expect(Array.from(clientList)).to.be.deep.equal(addUsersList);
      
      client.getAllUsers.resetHistory();
      client.addUsersToList.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: emptyUsersList },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getAllUsers.called).to.be.false;
      expect(client.addUsersToList.calledOnce).to.be.false;
      expect(action).to.be.deep.equal(expectedAction3);
      expect(Array.from(clientList)).to.be.deep.equal(addUsersList);
    });
  });
  
  it('must remove users', function() {
    var removeUsersList1 = ["<@uid1>", "<@uid2>"];
    var removeUsersList2 = ["<@uid3>"];
    var emptyUsersList = [];
    
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
    clientList = new Set(["<@uid1>", "<@uid2>", "<@uid3>"]);
    
      
    return ih.handleIntent(
      "removeUserCommand",
      { users: removeUsersList1 },
      { channel: channel }
    ).then(function (action) {
      expect(client.removeUsersFromList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction1);
      expect(Array.from(clientList)).to.be.deep.equal(removeUsersList2);
      
      client.removeUsersFromList.reset();
    }).then(function () {
      return ih.handleIntent(
        "removeUserCommand",
        { users: removeUsersList2 },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.removeUsersFromList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction2);
      expect(Array.from(clientList)).to.be.deep.equal(emptyUsersList);
    });
  });
  
  it('must accept removing users from an empty channel gracefully');
  
  it('must list users', function () {
    
    var users = ["<@uid1>", "<@uid2>", "<@uid3>"];
    var expectedAction = {
      intent: "informListStatus",
      entities: {
        users: users
      }
    };
    var channel = 'someChannel';
    var ih = new IntentHandler(client);
    clientList = new Set(users);
    
    return ih.handleIntent(
      "listUsersCommand",
      {},
      { channel: channel }
    ).then(function (action) {
      expect(client.getList.calledOnce).to.be.true;
      expect(action).to.be.deep.equal(expectedAction);
    });
  });
  
  it('must pair users', function () {    
    var users = ["<@uid1>", "<@uid2>", "<@uid3>", "<@uid4>", "<@uid5>", "<@uid6>", "<@uid7>"];
    var channel = 'someChannel';
    var ih = new IntentHandler(client);
    clientList = new Set(users);
    
    return ih.handleIntent(
      "pairUsersCommand",
      {},
      { channel: channel }
    ).then(function (action) {
      expect(client.getList.calledOnce).to.be.true;
      expect(action.intent).to.be.equal('informPairStatus');
      
      // ensure that every user is contained in the pairs
      var groups = action.entities.groups;
      var usersInGroups = groups.reduce(function (list, group) {
        return list.concat(group);
      }, []);
      expect(usersInGroups.sort()).to.be.deep.equal(users.sort());
    });
  });
  
  it('must separate @real_users and names', function () {
    var addUsersList1 = ["<@uid1>", "<@uid2>"];
    var addUsersList2 = ["@uid3", "<@uid3>"];
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
        unknownUsers: ["@uid3"],
        existingUsers: [],
        knownUsers: ["<@uid3>"]
      }
    };    
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    
    expect(client.getAllUsers.called).to.be.false;
    
    return ih.handleIntent(
      "addUserCommand",
      { users: addUsersList1 },
      { channel: channel }
    ).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      expect(client.addUsersToList.calledOnce).to.be.true;
      expect(Array.from(clientList)).to.be.deep.equal(addUsersList1);
      expect(action).to.be.deep.equal(expectedAction1);
      
      client.getAllUsers.resetHistory();
      client.addUsersToList.reset();
    }).then(function () {
      return ih.handleIntent(
        "addUserCommand",
        { users: addUsersList2 },
        { channel: channel }
      );
    }).then(function (action) {
      expect(client.getAllUsers.calledOnce).to.be.true;
      // sort to make sure they are in same order
      expect(Array.from(clientList).sort()).to.be.deep.equal(addUsersList1.concat(addUsersList2).sort());
      expect(action).to.be.deep.equal(expectedAction2);
    });
  });
});