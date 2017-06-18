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
          .then(({knownUsers, unknownUsers, existingUsers}) => {
            // add ids to our list
            // FIXME should use Set instead of array
            knownUsers.forEach((id) => this.list[context.channel].add(id));
            unknownUsers.forEach((id) => this.list[context.channel].add(id));

            action = {intent: "informAddStatus", entities: {unknownUsers, knownUsers, existingUsers}};

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

        action = {intent: "informRemoveStatus", entities: {removedUsers, unknownUsers}};

        resolve(action);
      } else if (intent === "listUsersCommand") {
        let users = Array.from(this.list[context.channel]);

        action = {intent: "informListStatus", entities: {users}};
        resolve(action);
      } else if (intent === "pairUsersCommand") {
        let users = Array.from(this.list[context.channel]);

        if (users.length <= 3) {
          action = {intent: "warnNotEnoughUsersToPair", entities: {users}};
        } else {
          shuffle(users);
          
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
      } else if (intent === "greeting") {
        action = { intent: "introduce" };
        resolve(action);
      } else if (intent === "help") {
        action = { intent: "introduce" };
        resolve(action);
      } else if (intent === "invite") {
        action = { intent: "introduce" };
        resolve(action);
      } else {
        reject(new Error(`don't know how to deal with "${intent}" intent`));
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
      response.members.forEach(user => { userMap[user.id] = user; });

      // look up each user id that the messager asked to add
      // will be undefined if that user id doesn't exist
      // FIXME need to remove slack specific logic
      let usersToAdd = usersIdToAdd.map(text => {
        const matches = text.match(/<@(.+)>/);
        let userId;
        if (matches) {
          userId = matches[1]; // remove <@ ... > wrapper
        }
        return { user: userMap[userId], text };
      });

      // add users to our list. keep track of unknown users
      let unknownUsers = [];
      let knownUsers = [];
      let existingUsers = [];
      usersToAdd.forEach(result => {
        let id;
        if (list.has(result.text)) {
          existingUsers.push(result.text);
        } else if (result.user) {
          knownUsers.push(result.text);
        } else {
          id = result.text;
          unknownUsers.push(result.text);
        }
      });
      
      return Promise.resolve({
        knownUsers,
        unknownUsers,
        existingUsers
      });
    });
  }
}

module.exports = IntentHandler;