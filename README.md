# The Basement Constable

Often times at happyfriendtime.slack.com, we wonder who is the one true basement king. "The Basement Constable" (tm) is here to help us definitely decide who that is.

# What is it?

The Basement Constable is a slackbot that is backed by [Stdlib](https://stdlib.com/) as a serverless set of APIs and storage. Additionally, there exists a "scoreboard" Google sheets that acts as a mutable data store to read and/or write to after each command.

# How to use it (Commands)

- [/pts](https://github.com/hellokoji/basement-king#pts)
- [/score](https://github.com/hellokoji/basement-king#score)

The Basement Constable uses "slash" commands to invoke its functions. The integration within the Slack organization needs to be configured to send a request to the specific Stdlib url. After a slash command is typed, the message payload is then sent to Stdlib app and ingested into the `functions/commands/SLASH_COMMAND_NAME.js` function.

Stdlib allows the bot to listen to any standard slack events and perform a callback function with Slack's standardized callback API. A JSON object is sent back to Slack with a few fields like `text`, `channel`, and `attachments` specifying the payload of the message you want to send. You can read more about it [here in the Slack documentation](https://api.slack.com/docs/messages).

## `/pts`

`Usage: /pts username(,username2,...) +/-# message(optional)`

The main command and entry-point for the Basement Constable. Used to add or subtract points from participants in the sheet. Can have multiple usernames for a single query. Points and messages for the query are distributed. Prints a digested query and the modified scoreboard following the query.

### Example:
Query: `/pts hellokoji,phoebethedog +1 Because they live in California`

Response:
```
@koji: hellokoji phoebethedog +1 pts -- Because they live in California
Username      Points
------------  ------
hellokoji     1
phoebethedog  1
```

## `/score`

`Usage: /score`

Prints the current state of the scoreboard ordered by point value in a separate code block.

### Example:
Query: `/score`

Response:
```
Username      Points
------------  ------
hellokoji     1
phoebethedog  1
```