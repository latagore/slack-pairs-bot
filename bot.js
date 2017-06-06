var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var includes = require('underscore.string/include');
var startsWith = require('underscore.string/startsWith');

var bot_token = process.env.SLACK_BOT_TOKEN;
if (!bot_token) throw new Error("Need to provide SLACK_BOT_TOKEN environment variable");
var token = process.env.SLACK_API_TOKEN;
if (!token) throw new Error("Need to provide SLACK_API_TOKEN environment variable");

var web = new WebClient(token);
var rtm = new RtmClient(bot_token);

var botUser;
var list; 

// The client will emit an RTM. event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
  botUser = rtmStartData.self;
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message); //this is no doubt the lamest possible message handler, but you get the idea
  if (startsWith(message.text, botUser.name)) {
    // remove bot username from message
    let messageText = message.text.replace(new RegExp(`^${botUser.name} `), '');
    
    if (startsWith(messageText, 'add user')) {
      let usersIdToAdd = messageText.replace(/add user(s)? /, '').split(/s+/);
      let allUsers = web.users.list(false, (err, res) => {
        if (err || !res.ok) {
         // TODO add error message
        } else {
          let userMap = {};
          res.results.forEach(user => {userMap[user.name] = user;});
          
          let usersToAdd = usersIdToAdd.map(text => {
            const result = { user: userMap[text], text };
            return result;
          });
          
          let unknownUsers = [];
          usersToAdd.forEach(result => {
            let id;
            if (result.user) {
              id = result.user.id; // FIXME
            } else {
              id = result.text;
              unknownUsers.push(result.text);
            }
            list[message.channel] = list[message.channel] || [];  // FIXME
            list[message.channel].push(id);
          });
          
          if (unknownUsers.length) {
            
          } else {
            // TODO "I added `length` users!
          }
        }
      });
    } else if (startsWith(messageText, 'remove user')) {
      let userIds = messageText.replace(/add user(s)? /, '').split(/s+/);
      let unknownUsers = [];
      userIds.forEach(id => {
        if (list[message.channel].includes(id)) {
          list[message.channel][id] = undefined;
        } else {
          unknownUsers.push(id);
        }
      });
      
      if (unknownUsers.length) {
        
      } else {
        // TODO "I added `length` users!
      }
    }
  } 
});

rtm.start();