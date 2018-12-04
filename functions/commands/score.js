const Scoreboard = require('../../utils/scoreboard.js');

/**
* /score
*
*   What's the score? command. Echoes to the channel what the score is
*   back to the channel. Spits out the player name, username, and current
*   points.
*
*
* @param {string} user The user id of the user that invoked this command (name is usable as well)
* @param {string} channel The channel id the command was executed in (name is usable as well)
* @param {string} text The text contents of the command
* @param {object} command The full Slack command object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/
module.exports = (user, channel, text = '', command = {}, botToken = null, callback) => {
  Scoreboard.getScoreboard(players => {
    let out = '';
    for (let player in players) {
      if (players.hasOwnProperty(player)) {
        out += player + ' : ' + players[player].points + '\n';          
      }
    }
    callback(null, {
      text: out,
      attachments: [
        // You can customize your messages with attachments.
        // See https://api.slack.com/docs/message-attachments for more info.
      ]
    });
  });
};
