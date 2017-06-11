

class IntentHandler {
  constructor(client) {
    this.client = client;
    this.list = {};
  }
  
  handleIntent(intent, entities, context) {
    // things needed
    // user list
    // channel name
    // requestor name
    // actual message?
    if (intent === "addUserCommand") {
      let usersIdToAdd = Array.from(new Set(entities.users));
      
      if (!entities.users.length) {
        this.client.messageChannel('I didn\'t see any names to add. You can try something similar to "add users @joe @bob".');
      }
      
      // fetch users based on entities from message
      this.list[context.channel] = this.list[context.channel] || new Set();
      return this.classifyUsers(usersIdToAdd, this.list[context.channel])
      .then(({knownUsers, unknownUsers, duplicateUsers}) => {
        // add ids to our list
        // FIXME should use Set instead of array
        knownUsers.forEach((id) => this.list[context.channel].add(id));
        unknownUsers.forEach((id) => this.list[context.channel].add(id));

        // answer the requestor
        // TODO add message on duplicate users
        if (unknownUsers.length) {
          this.client.messageChannel(`I added ${knownUsers.length + unknownUsers.length}. I don't know who ${unknownUsers.join(', ')} are, but I added them anyways.`, context.userId);
          this.client.messageChannel(`You can say "remove users ${unknownUsers.join(' ')}" to remove them.`);
        } else {
          this.client.messageChannel(`I added ${knownUsers.length} users!`, context.userId);
        }
      })
      .catch((err) => {
        console.error(err);
        this.client.messageChannel(`Something went wrong. Let our software monkeys know that this bot has malfunctioned.`);
      });
    } else if (intent === "removeUserCommand") {
      if (!entities.users.length) {
        this.client.messageChannel('I didn\'t see any names to remove. You can try something similar to "remove users @joe @bob".');
      }
      
      let usersIdToRemove = Array.from(new Set(entities.users));
      
      const removedUsers = [];
      const unknownUsers = [];
      usersIdToRemove.forEach(userId => {
        if (this.list[context.channel].has(userId)) {
          removedUsers.push(userId);
          this.list[context.channel].delete(userId);
        } else {
          unknownUsers.push(userId);
        }
      });
      
      if (removedUsers.length) {
        this.client.messageChannel(`I removed ${removedUsers.join(', ')} from my list.`);
      }
      if (unknownUsers.length) {
        this.client.messageChannel(`Hm... My list doesn't have ${unknownUsers.join(', ')}. You can see who's in my list with "list users".`);
      }
    } 
  }

  classifyUsers(usersIdToAdd, list) {
    return this.client.getUsers()
    .then((response) => {
      if (!response.ok) {
       throw new Error(response);
      } 

      // create lookup map for all users by their id
      let userMap = {};
      response.members.forEach(user => {userMap[user.name] = user;});

      // look up each user id that the messager asked to add
      // will be undefined if that user id doesn't exist
      let usersToAdd = usersIdToAdd.map(text => {
        const result = { user: userMap[text], text };
        return result;
      });

      // add users to our list. keep track of unknown users
      let unknownUsers = [];
      let knownUsers = [];
      let duplicateUsers = [];
      usersToAdd.forEach(result => {
        let id;
        // FIXME need to separate @usertext and "usertext"
        if (list.has(result.user.name)) {
          duplicateUsers.push(result.user.name);
        } else if (list.has(result.text)) {
          duplicateUsers.push(result.text);
        } else if (result.user) {
          id = result.user.name;
          knownUsers.push(id);
        } else {
          id = result.text;
          unknownUsers.push(id);
        }
      });
      
      return Promise.resolve({
        knownUsers,
        unknownUsers,
        duplicateUsers
      });
    });
  }
}

module.exports = IntentHandler;