const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const SlackClient = require('./slack/SlackClient.js');

const bot_token = process.env.SLACK_BOT_TOKEN;
if (!bot_token) throw new Error("Need to provide SLACK_BOT_TOKEN environment variable");
const token = process.env.SLACK_API_TOKEN;
if (!token) throw new Error("Need to provide SLACK_API_TOKEN environment variable");

const web = new WebClient(token);
const rtm = new RtmClient(bot_token);
rtm.start();

let botUser;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Bot started. Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}.`);
  const slackClient = new SlackClient(rtm, web, rtmStartData);
  botUser = rtmStartData.self;
});
