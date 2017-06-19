/* jshint expr:true */
/* allow expr because of chai.expect */
var IntentInterpreter = require('../core/IntentInterpreter.js');
var expect = require('chai').expect;
var sinon = require('sinon');

var BOT_NAME = "pairsbot";
var WRAPPED_BOT_NAME = "<@" + BOT_NAME + ">";
var ii = new IntentInterpreter(BOT_NAME);

describe('intent intepreters', function () {
  it('must translate messages intending to add users', function () {
    var messages = [
      WRAPPED_BOT_NAME + " add users @joe @amy",
      WRAPPED_BOT_NAME + " add user @joe @amy",
      WRAPPED_BOT_NAME + " add people @joe @amy",
      WRAPPED_BOT_NAME + " add @joe @amy",
      
      "  " + WRAPPED_BOT_NAME + "      add    users @joe   @amy    ",
      "  " + WRAPPED_BOT_NAME + "      add @joe   @amy    ",
      "  " + WRAPPED_BOT_NAME + "      add @joe   amy  @bob @alice fatima lee  "
    ];
    // change into object with text property
    messages = messages.map(function (m) {
      return { text: m, type: 'message' };
    });
    
    var results = messages.map(function (m) { return ii.interpret(m); });
    var expected = [
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "amy", "@bob", "@alice", "fatima", "lee"]}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    expect(results[2]).to.be.deep.equal(expected[2]);
    expect(results[3]).to.be.deep.equal(expected[3]);
    
    // robustness tests
    expect(results[4]).to.be.deep.equal(expected[4]);
    expect(results[5]).to.be.deep.equal(expected[5]);
    expect(results[6]).to.be.deep.equal(expected[6]);
  });
  
  it('must translate messages intending to remove users', function () {
    var messages = [
      WRAPPED_BOT_NAME + " remove users @joe @amy",
      WRAPPED_BOT_NAME + " remove user @joe @amy",
      WRAPPED_BOT_NAME + " remove people @joe @amy",
      WRAPPED_BOT_NAME + " remove @joe @amy",
      
      "  " + WRAPPED_BOT_NAME + "      remove    users @joe   @amy    ",
      "  " + WRAPPED_BOT_NAME + "      remove @joe   @amy    ",
      "  " + WRAPPED_BOT_NAME + "      remove @joe   amy  @bob @alice fatima lee  "
    ];
    // change into object with text property
    messages = messages.map(function (m) {
      return { text: m, type: 'message' };
    });
    
    var results = messages.map(function (m) { return ii.interpret(m); });
    var expected = [
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "amy", "@bob", "@alice", "fatima", "lee"]}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    expect(results[2]).to.be.deep.equal(expected[2]);
    expect(results[3]).to.be.deep.equal(expected[3]);
    
    // robustness tests
    expect(results[4]).to.be.deep.equal(expected[4]);
    expect(results[5]).to.be.deep.equal(expected[5]);
    expect(results[6]).to.be.deep.equal(expected[6]);
  });
  
  it('must translate messages intending to list users', function () {
    var messages = [
      WRAPPED_BOT_NAME + " list users",
      WRAPPED_BOT_NAME + " list",
      
      "   " + WRAPPED_BOT_NAME + "      list   users ",
      "   " + WRAPPED_BOT_NAME + "      list   ",
    ];
    // change into object with text property
    messages = messages.map(function (m) {
      return { text: m, type: 'message' };
    });
    
    var results = messages.map(function (m) { return ii.interpret(m); });
    var expected = [
      { intent: "listUsersCommand", entities: {}, isForBot: true },
      { intent: "listUsersCommand", entities: {}, isForBot: true },
      
      { intent: "listUsersCommand", entities: {}, isForBot: true },
      { intent: "listUsersCommand", entities: {}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    
    // robustness tests
    expect(results[2]).to.be.deep.equal(expected[2]);
    expect(results[3]).to.be.deep.equal(expected[3]);
  });
  
  it('must translate messages intending to pair users', function () {
    var messages = [
      WRAPPED_BOT_NAME + " pair users",
      WRAPPED_BOT_NAME + " pair",
      WRAPPED_BOT_NAME + " pairs",
      "   " + WRAPPED_BOT_NAME + "   pairs      ",
      "   " + WRAPPED_BOT_NAME + " pairs    users  "
    ];
    // change into object with text property
    messages = messages.map(function (m) {
      return { text: m, type: 'message' };
    });
    
    var results = messages.map(function (m) { return ii.interpret(m); });
    var expected = [
      { intent: "pairUsersCommand", entities: {}, isForBot: true },
      { intent: "pairUsersCommand", entities: {}, isForBot: true },
      { intent: "pairUsersCommand", entities: {}, isForBot: true },
      { intent: "pairUsersCommand", entities: {}, isForBot: true },
      { intent: "pairUsersCommand", entities: {}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    expect(results[2]).to.be.deep.equal(expected[2]);
    expect(results[3]).to.be.deep.equal(expected[3]);
    expect(results[4]).to.be.deep.equal(expected[4]);
  });
});