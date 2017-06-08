# bot design
## Problem
Create random programming pairs for students for the first week. Optionally, pair students based on progress.

## Steps on how to use
1. Add bot to channel
2. Add people to be paired up
3. Pair people up
4. Pair people up again on another day, for at least a couple days

What might happen after:
- Add or remove people to be paired up
- Reset the history of people who have been paired up
- List people to be added

## Operations
Invite to channel: 
* say hello

Add user(s):
- one valid user /u/
  * add user
  * say "I added /u/!"
- one invalid user /u/
  * look up /u/
  * say "I can't find /u/. Do you want to add them anyways?"
- many users, some of which are invalid
  * look up user
  * say "I can't find $user1, $user2, $user3. Do you want to add them anyways?

List user(s)

## Internal design

### model.js
function recieveMessage(message, context)
  {intent, entities} = getIntent(message);
  handleIntent(intent, entities, context);
end

private function getIntent(message)
  returns the intent of the message and the entities contained in it

private function handleIntent(intent, entities, context)
  intentHandler.handle(intent, entities, context)
end

#### IntentHandler
function handle(intent, entities, context) 
  if intent is addUserCommand
    execute command to match intent using abstracted "this.client"
  else if ...
    ...
  end if
end


## Grammar
/addUserCommand/
  /bot/ add [/user_entity/] /list/
/removeUserCommand/
  /bot/ remove [/user_entity/] /list/
/pairCommand/
  /bot/ pair [/user_entity]
/listCommand/
  /bot/ list [/user_entity]
/user_entity/
  user
  users
  people
/list/
  /user/
  /user/ /list/
/user/
  /string/