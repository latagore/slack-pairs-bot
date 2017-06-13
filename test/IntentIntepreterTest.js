/* jshint expr:true */
/* allow expr because of chai.expect */
var intentIntepreter = require('../core/IntentInterpreter.js');
var utils = require('../core/utils.js');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('intent intepreters', function () {
  it('must translate messages intending to add users', function () {
    var messages = [
      utils.BOT_NAME + " add users @joe @amy",
      utils.BOT_NAME + " add user @joe @amy",
      utils.BOT_NAME + " add people @joe @amy",
      utils.BOT_NAME + " add @joe @amy",
    ];
    
    var results = messages.map(intentIntepreter);
    var expected = [
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "addUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    expect(results[2]).to.be.deep.equal(expected[2]);
    expect(results[3]).to.be.deep.equal(expected[3]);
  });
  
  it('must translate messages intending to remove users', function () {
    var messages = [
      utils.BOT_NAME + " remove users @joe @amy",
      utils.BOT_NAME + " remove user @joe @amy",
      utils.BOT_NAME + " remove people @joe @amy",
      utils.BOT_NAME + " remove @joe @amy",
    ];
    
    var results = messages.map(intentIntepreter);
    var expected = [
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true },
      { intent: "removeUserCommand", entities: {users: ["@joe", "@amy"]}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    expect(results[2]).to.be.deep.equal(expected[2]);
    expect(results[3]).to.be.deep.equal(expected[3]);
  });
  
  it('must translate messages intending to list users', function () {
    var messages = [
      utils.BOT_NAME + " list users",
      utils.BOT_NAME + " list"
    ];
    
    var results = messages.map(intentIntepreter);
    var expected = [
      { intent: "listUsersCommand", entities: {}, isForBot: true },
      { intent: "listUsersCommand", entities: {}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
  });
  
  it('must translate messages intending to pair users', function () {
    var messages = [
      utils.BOT_NAME + " pair users",
      utils.BOT_NAME + " pair",
      utils.BOT_NAME + " pairs"
    ];
    
    var results = messages.map(intentIntepreter);
    var expected = [
      { intent: "pairUsersCommand", entities: {}, isForBot: true },
      { intent: "pairUsersCommand", entities: {}, isForBot: true },
      { intent: "pairUsersCommand", entities: {}, isForBot: true }
    ];
     
    // use indices so we can see which expect failed by looking at
    // the line number
    expect(results[0]).to.be.deep.equal(expected[0]);
    expect(results[1]).to.be.deep.equal(expected[1]);
    expect(results[2]).to.be.deep.equal(expected[2]);
  });
});