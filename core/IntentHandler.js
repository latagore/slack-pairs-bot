/**
 * Shuffles array in place. ES6 version
 * From https://stackoverflow.com/a/6274381
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}


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
    this.list[context.channel] = this.list[context.channel] || new Set();
    
    if (intent === "addUserCommand") {
      let usersIdToAdd = Array.from(new Set(entities.users));
      
      if (!entities.users.length) {
        this.client.messageChannel('I didn\'t see any names to add. You can try something similar to "add users @joe @bob".');
      } else {
      
        // fetch users based on entities from message
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
          this.client.messageChannel(`Something went wrong. Let our software monkeys know that this bot has malfunctioned.`, context.userId);
        });
      }
    } else if (intent === "removeUserCommand") {
      if (!entities.users.length) {
        this.client.messageChannel('I didn\'t see any names to remove. You can try something similar to "remove users @joe @bob".', context.userId);
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
        this.client.messageChannel(`Hm... My list doesn't have ${unknownUsers.join(', ')}. You can see who's in my list with "list users".`, context.userId);
      }
    } else if (intent === "listUsersCommand") {
      let users = Array.from(this.list[context.channel]);
      this.client.messageChannel(`I have ${users.length} people in my list. They are: /${users.join(", ")}/.`);
    } else if (intent === "pairUsersCommand") {
      let users = Array.from(this.list[context.channel]);
      shuffle(users);
      
      if (users.length === 0) {
        this.client.messageChannel('Currently, there are no users in my list. Try adding more people with "add users @joe @bob".', context.userId);
      } else if (users.length === 1) {
        this.client.messageChannel('I can\'t pair just a single person! Try adding more people with "add users @joe @bob".', context.userId);
      } else if (users.length === 2) {
        this.client.messageChannel(`:) I paired your pair, but you should probably add more users: ${users.join(', ')}`, context.userId);
      } else {
        const groups = [];
        while (users.length > 3) {
          const pair = [];
          pair.push(users.pop());
          pair.push(users.pop());
          
          groups.push(pair);
        }
        
        // add remaining people in one group
        // whether it has 2 or 3 people
        groups.push(users);
        
        let groupsString = groups
          .map(group => group.join(' - '))
          .join("\n");
        this.client.messageChannel(`Here are your pairs: \`\`\`${groupsString}\`\`\``);
      }
    }
    
    return Promise.resolve();
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