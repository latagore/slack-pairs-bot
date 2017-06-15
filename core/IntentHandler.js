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
    
    let action;
    const promise = new Promise((resolve, reject) => {

      if (intent === "addUserCommand") {
        let usersIdToAdd = Array.from(new Set(entities.users));

        if (!entities.users.length) {
          action = {intent: "warnNoUsersToAdd"};
          resolve(action);
        } else {
          // fetch users based on entities from message
          this.classifyUsers(usersIdToAdd, this.list[context.channel])
          .then(({knownUsers, unknownUsers, duplicateUsers}) => {
            // add ids to our list
            // FIXME should use Set instead of array
            knownUsers.forEach((id) => this.list[context.channel].add(id));
            unknownUsers.forEach((id) => this.list[context.channel].add(id));

            action = {intent: "informAddStatus", entities: {unknownUsers, knownUsers, duplicateUsers}};

            resolve(action);
          })
          .catch((err) => {
            console.error(err);
            action = {intent: "exceptionThrown"};
            resolve(action);
          });
        }
      } else if (intent === "removeUserCommand") {
        if (!entities.users.length) {
          action = {intent: "warnNoUsersToRemove"};
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

        // FIXME should include duplicate users
        action = {intent: "informRemoveStatus", entities: {removedUsers, unknownUsers}};

        resolve(action);
      } else if (intent === "listUsersCommand") {
        let users = Array.from(this.list[context.channel]);

        action = {intent: "informListStatus", entities: {users}};
        resolve(action);
      } else if (intent === "pairUsersCommand") {
        let users = Array.from(this.list[context.channel]);
        shuffle(users);

        if (users.length <= 3) {
          action = {intent:"warnNotEnoughUsersToPair"};
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

          action = {intent: "informPairStatus", entities: {groups}};
        }
        resolve(action);
      } else {
        resolve();
      }
    });
    
    return promise;
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
        if (text.startsWith("@")) {
          text = text.slice(1); // remove @ prefix
          const result = { user: userMap[text], text };
          return result;
        }
        return {text}; // FIXME need to revisit this...
      });

      // add users to our list. keep track of unknown users
      let unknownUsers = [];
      let knownUsers = [];
      let duplicateUsers = [];
      usersToAdd.forEach(result => {
        let id;
        // FIXME change to nested ifs
        if (result.user && list.has("@" + result.user.name)) {
          duplicateUsers.push("@" + result.user.name);
        } else if (list.has(result.text)) {
          duplicateUsers.push(result.text);
        } else if (result.user) {
          id = "@" + result.user.name;
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