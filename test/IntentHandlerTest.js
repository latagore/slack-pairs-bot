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
      message: sinon.spy()  
    };
    
    var addUsersList = ["joe", "bob"];
    var channel = "someChannel";
    var ih = new IntentHandler(client);
    ih.handleIntent(
      "addUserCommand",
      { users: addUsersList },
      { channel: channel }
    );
    
    expect(client.getUsers.calledOnce).to.be.true; // stub may not have "calledOnce"
    //expect(client.message.calledOnce).to.be.true;
    expect(IntentHandler.list[channel]).to.be.equal(addUsersList);
    
  });
});