const utils = require('./utils.js');
const englishJoinList = utils.englishJoinList;

class BotintentTranslator {
  constructor(client) {
    this.client = client;
  }
  
  warnNoUsersToAdd({context}) {
    this.client.messageChannel('I didn\'t see any names to add. You can try something similar to "${utils.BOT_NAME} add users @joe @bob".', context.request.channelId, context.request.userHandle); 
  }
  
  informAddStatus({entities, context}) {
    const {knownUsers, unknownUsers, existingUsers} = entities;
    if (knownUsers.length) {
      this.client.messageChannel(`I added ${englishJoinList(knownUsers)}!`, context.request.channelId);
    }
    if (unknownUsers.length) {
      if (unknownUsers.length === 1) {
        this.client.messageChannel(`I don't know who ${englishJoinList(unknownUsers)} is, but I added them anyways. Say "${utils.BOT_NAME} remove ${unknownUsers.join(" ")}" to remove them.`, context.request.channelId, context.request.userHandle);
      } else {
        this.client.messageChannel(`I don't know who ${englishJoinList(unknownUsers)} are, but I added them anyways. Say "${utils.BOT_NAME} remove ${unknownUsers.join(" ")}" to remove them.`, context.request.channelId, context.request.userHandle);
      }
    }
    if (existingUsers.length) {
      if (existingUsers.length === 1) {
        this.client.messageChannel(`Note: ${englishJoinList(existingUsers)} is already in my list.`, context.request.channelId, context.request.userHandle);
      } else {
        this.client.messageChannel(`Note: ${englishJoinList(existingUsers)} are already in my list.`, context.request.channelId, context.request.userHandle);
      }
    }
  }
  
  exceptionThrown({context}) {
    this.client.messageChannel("Something went wrong with your last request. Try again later or ask someone to fix me.", context.request.userHandle);
  }
  
  warnNoUsersToRemove({context}) {
    this.client.messageChannel(`I didn\'t see any names to add. You can try something similar to "${utils.BOT_NAME} remove users @joe @bob".`, context.request.userHandle);
  }
  
  informRemoveStatus({entities, context}) {
    const {removedUsers, unknownUsers} = entities;
    if (removedUsers.length) {
      this.client.messageChannel(`I removedUsers ${englishJoinList(removedUsers)}!`);
    }
    if (unknownUsers.length) {
      if (unknownUsers.length === 1) {
        this.client.messageChannel(`Note: ${englishJoinList(unknownUsers)} aren't in my list. Maybe you spelled their name wrong?`, context.request.userHandle);
      } else {
        this.client.messageChannel(`Note: ${englishJoinList(unknownUsers)} isn't in my list. Maybe you spelled their name wrong?`, context.request.userHandle);
      }
    }
  }
  
  informListStatus({entities, context}) {
    const {users} = entities;
    if (!users.length) {
      this.client.messageChannel(`I don't have any people in my list. You can try something similar to "${utils.BOT_NAME} add users @joe @bob" to add some.`);
    } else if (users.length === 1) {
      this.client.messageChannel(`${englishJoinList(users)} is the only person in my list.`);
    } else {
      this.client.messageChannel(`I have ${users.length} people in my list. They are: ${englishJoinList(users)}`);
    }
  }
  
  warnNotEnoughUsersToPair({entities, context}) {
    const {users} = entities;
    if (users.length === 0) {
      this.client.messageChannel(`There are no users to pair. You can try something similar to "${utils.BOT_NAME} add users @joe @bob" to add some.`, context.request.userHandle);
    } else if (users.length === 1) {
      this.client.messageChannel(`I can't pair only one person! You can try something similar to "${utils.BOT_NAME} add users @joe @bob" to add some.`, context.request.userHandle);
    } else if (users.length === 2) {
      this.client.messageChannel(`Here's your pair: ${users.join(" - ")}. You probably want to add more users though. You can try "${utils.BOT_NAME} add users @joe @bob".`, context.request.userHandle);
    } else {
      console.error(new Error("we shouldn't be warning when there are more than 2 users!"));
      this.exceptionThrown(context);
    }
  }
  
  informPairStatus({entities, context}) {
    const {groups} = entities;
    const groupsString = groups.map((g) => g.join(" - "))
      .join("\n");
    
    this.client.messageChannel(`Here are your pairs: \n${groupsString}`);
  }
}
module.exports = BotintentTranslator;
//  if (users.length === 0) {
//    this.client.messageChannel('Currently, there are no users in my list. Try adding more people with "add users @joe @bob".', context.userId);
//  } else if (users.length === 1) {
//    this.client.messageChannel('I can\'t pair just a single person! Try adding more people with "add users @joe @bob".', context.userId);
//  } else if (users.length === 2) {
//    this.client.messageChannel(`:) I paired your pair, but you should probably add more users: ${users.join(', ')}`, context.userId);
//  } else {
//
//  }
  
  
  // pair users
//  let groupsString = groups
//    .map(group => group.join(' - '))
//    .join("\n");
//  this.client.messageChannel(`Here are your pairs: \`\`\`${groupsString}\`\`\``);