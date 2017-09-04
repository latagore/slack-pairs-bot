pairsbot is a chat bot for Slack, which puts a list of people into pairs, originally for programming pairs. To use pairsbot, you invite pairsbot to your channel, add some users to pairsbot's list, and then ask pairsbot to pair people in that list.

# How to set up
1. Ensure you have a Slack team to add the bot to as well as a Heroku account.
2. [Create a legacy token on Slack.](https://api.slack.com/custom-integrations/legacy-tokens)
3. Create a bot user. You can find the link somewhere on the [Bot Users documentation page](https://api.slack.com/bot-users), last found at "Creating a new bot user."
4. [Clone the git repository.](https://github.com/latagore/slack-pairs-bot)
5. Create a Heroku app.
6. Create a MongoDB instance. [You can use one from mLab for free.](https://mlab.com/)
7. [Ensure the heroku command line utility is installed.](https://devcenter.heroku.com/articles/heroku-cli)
8. Change directory to the git repository in a terminal.
9. Deploy the repository to Heroku using `heroku git:remote -a "app-name"`, where "app-name" is the name of the Heroku app you created in step 5.
10. Set up the configuration variables using `heroku config:set KEY=value` using the following:
```
MONGODB_URI=mongodb://somestuff
SLACK_API_TOKEN=token
SLACK_BOT_TOKEN=token
```
11. Scale the `web` dynos down and the `worker` dyno up: `heroku ps:scale web=0 worker=1` The bot probably will not scale well past 1, since it will connect more than once.
12. Finished! Go invite the bot to a channel and then message the bot by mentioning it: "@pairsbot hello"
