const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const SlackClient = require('./slack/SlackClient.js');
const MongoClient = require("mongodb").MongoClient;

const bot_token = process.env.SLACK_BOT_TOKEN;
if (!bot_token) throw new Error("Need to provide SLACK_BOT_TOKEN environment variable");
const token = process.env.SLACK_API_TOKEN;
if (!token) throw new Error("Need to provide SLACK_API_TOKEN environment variable");
const mongodb_uri = process.env.MONGODB_URI;
if (!mongodb_uri) throw new Error("Need to provide MONGO_URI environment variable");


const web = new WebClient(token);
const rtm = new RtmClient(bot_token);

let botUser;
MongoClient.connect(mongodb_uri, (err, db) => {
  if (err) throw err;
  
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Bot started. Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}.`);
    const slackClient = new SlackClient(rtm, web, db, rtmStartData);
    botUser = rtmStartData.self;
  });
  rtm.start();
});