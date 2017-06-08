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
* say hello and how to use

Add user(s):
- one valid user /u/
  * add user
  * say "I added /u/!"
- one invalid user /u/
  * look up /u/
  * say "I can't find /u/. Do you want to add them anyways?"
- many users, some of which are invalid
  * look up users
  * say "I can't find $user1, $user2, $user3, but I added them anyways.
- add duplicate users
  * add as normal but only use unique names
- add some users that have already been added.
  * look up users
  * say "$user1 and $user2 is my list, so I can already pair them."
- add some users that haven't been added and some that have
  * look up users
  * say "I've added $user1 and $user2".
  * say "$user3 is my list, so I can already pair them."
- add some users that have been added, some that haven't and some that don't exist
  * look up users
  * say "I've added $user1 and ..."
  * say "$user2 is in my list, so I can already pair them."
  * say "I don't know who $user3 is, but I added them anyways. You should add people by their slack name, if they have one in the future."

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