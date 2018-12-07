const Scoreboard = require('../../utils/scoreboard.js');

const RESTRICTED_CHANNELS = [
  'CEGN9SP0X', // #basementking
  'C1JVC6R3P', // #bot_dev
]

/**
* /score
*
*   What's the score? command. Echoes to the channel what the score is
*   back to the channel. Spits out the player name, username, and current
*   points.
*
* @param {string} user The user id of the user that invoked this command (name is usable as well)
* @param {string} channel The channel id the command was executed in (name is usable as well)
* @param {string} text The text contents of the command
* @param {object} command The full Slack command object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/
module.exports = (user, channel, text = '', command = {}, botToken = null, callback) => {
  if (RESTRICTED_CHANNELS.indexOf(channel) > -1) {
    Scoreboard.getScoreboard(players => {
      Scoreboard.getScoreboardTable(players, out => {
        callback(null, { text: '```' + out + '```' });
      });
    });
  } else {
    callback(null, {
      channel: user,
      text: 'You are not in the right channel! Try <#CEGN9SP0X>.',
    });
  }
};
