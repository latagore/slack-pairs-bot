const utils = require('./utils.js');
const englishJoinList = utils.englishJoinList;

const commands = [
  { name: 'Pair', description: 'Pairs people in my list.', usage: `${utils.BOT_NAME} pair`},
  { name: 'Add', description: 'Adds people to my list.', usage: `${utils.BOT_NAME} add users @joe @bob`},
  { name: 'Remove', description: 'Removes people from my list.', usage: `${utils.BOT_NAME} remove users @joe @bob`},
  { name: 'Show list', description: 'Shows the people in my list in this channel.', usage: `${utils.BOT_NAME} list users`},
];
const formattedCommands = commands.map(c => {
  return `${c.name}: \`${c.usage}\` _${c.description}_`;
}).join("\n");

class BotintentTranslator {
  constructor(client) {
    this.client = client;
  }
  
  warnNoUsersToAdd({context}) {
    this.client.messageChannel('I didn\'t see any names to add. You can try something similar to "${utils.BOT_NAME} add users @joe @bob".', context.channel, context.user); 
  }
  
  informAddStatus({entities, context}) {
    const {knownUsers, unknownUsers, existingUsers} = entities;
    if (knownUsers.length) {
      this.client.messageChannel(`I added ${englishJoinList(knownUsers)}!`, context.channel);
    }
    if (unknownUsers.length) {
      if (unknownUsers.length === 1) {
        this.client.messageChannel(`I don't know who ${englishJoinList(unknownUsers)} is, but I added them anyways. Say "${utils.BOT_NAME} remove ${unknownUsers.join(" ")}" to remove them.`, context.channel, context.user);
      } else {
        this.client.messageChannel(`I don't know who ${englishJoinList(unknownUsers)} are, but I added them anyways. Say "${utils.BOT_NAME} remove ${unknownUsers.join(" ")}" to remove them.`, context.channel, context.user);
      }
    }
    if (existingUsers.length) {
      if (existingUsers.length === 1) {
        this.client.messageChannel(`Note: ${englishJoinList(existingUsers)} is already in my list.`, context.channel, context.user);
      } else {
        this.client.messageChannel(`Note: ${englishJoinList(existingUsers)} are already in my list.`, context.channel, context.user);
      }
    }
  }
  
  exceptionThrown({context}) {
    this.client.messageChannel("Something went wrong with your last request. Try again later or ask someone to fix me.", context.channel, context.user);
  }
  
  warnNoUsersToRemove({context}) {
    this.client.messageChannel(`I didn\'t see any names to remove. You can try something similar to "${utils.BOT_NAME} remove users @joe @bob".`, context.channel, context.user);
  }
  
  informRemoveStatus({entities, context}) {
    const {removedUsers, unknownUsers} = entities;
    if (removedUsers.length) {
      this.client.messageChannel(`I removed ${englishJoinList(removedUsers)}!`, context.channel);
    }
    if (unknownUsers.length) {
      if (unknownUsers.length === 1) {
        this.client.messageChannel(`Note: ${englishJoinList(unknownUsers)} aren't in my list. Maybe you spelled their name wrong?`, context.channel, context.user);
      } else {
        this.client.messageChannel(`Note: ${englishJoinList(unknownUsers)} isn't in my list. Maybe you spelled their name wrong?`, context.channel, context.user);
      }
    }
  }
  
  informListStatus({entities, context}) {
    const {users} = entities;
    if (!users.length) {
      this.client.messageChannel(`I don't have any people in my list. You can try something similar to "${utils.BOT_NAME} add users @joe @bob" to add some.`, context.channel);
    } else if (users.length === 1) {
      this.client.messageChannel(`${englishJoinList(users)} is the only person in my list.`, context.channel);
    } else {
      this.client.messageChannel(`I have ${users.length} people in my list. They are: ${englishJoinList(users)}`, context.channel);
    }
  }
  
  warnNotEnoughUsersToPair({entities, context}) {
    const {users} = entities;
    if (users.length === 0) {
      this.client.messageChannel(`There are no users to pair. You can try something similar to "${utils.BOT_NAME} add users @joe @bob" to add some.`, context.channel, context.user);
    } else if (users.length === 1) {
      this.client.messageChannel(`I can't pair only one person! You can try something similar to "${utils.BOT_NAME} add users @joe @bob" to add some.`, context.channel, context.user);
    } else if (users.length === 2) {
      this.client.messageChannel(`Here's your pair: ${users.join(" - ")}. You probably want to add more users though. You can try "${utils.BOT_NAME} add users @joe @bob".`, context.channel, context.user);
    } else if (users.length === 3) {
      this.client.messageChannel(`Here's your triplet: ${users.join(" - ")}. You probably want to add more users though. You can try "${utils.BOT_NAME} add users @joe @bob".`, context.channel, context.user);
    } else {
      console.error(new Error("we shouldn't be warning when there are 3 users or more!"));
      this.exceptionThrown({context});
    }
  }
  
  informPairStatus({entities, context}) {
    const {groups} = entities;
    const groupsString = groups.map((g) => g.join(" - "))
      .join("\n");
    
    this.client.messageChannel(`Here are your pairs: \n${groupsString}`, context.channel);
  }
  
  introduce({context}) {
    this.client.messageChannel(`Hi, I'm ${utils.BOT_NAME}, a bot.\nI keep a list of people and can group them up into pairs, usually for pair programming. If there's an odd number of people, one group will have three people. Here's the things you can tell me to do:\n${formattedCommands}`, context.channel, context.user);
  }
}

module.exports = BotintentTranslator;
