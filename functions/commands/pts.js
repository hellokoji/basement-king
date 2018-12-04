const Scoreboard = require('../../utils/scoreboard.js');

/**
*   Extract points query from a string.

* @param {string} text The text contents of the command
* @returns {object} An object containing data of the points query.
*/
function getPointsFromMessage(text) {
  const pattern = /(\S+)\s((-|\+)?[0-9]+)\s?(.*)/
  const match = text.match(pattern);
  if (match === null) {
    throw new Error('Unable to extract points from message! - \"' + text + '\"');
  }
  const points = {};

  points.username = match[1];
  points.adjustment = parseInt(match[2]);
  points.msg = match[4];

  return points;
}

/**
* /pts
*
*   Modify points command.
*
*   See https://api.slack.com/slash-commands for more details.
*
* @param {string} user The user id of the user that invoked this command (name is usable as well)
* @param {string} channel The channel id the command was executed in (name is usable as well)
* @param {string} text The text contents of the command
* @param {object} command The full Slack command object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/
module.exports = (user, channel, text = '', command = {}, botToken = null, callback) => {
  let out, points;
  try {
    points = getPointsFromMessage(text);
    out = `<@${user}>: ${points.username} ${points.adjustment > 0 ? '+':''}${points.adjustment} pts${!!points.msg ? ' -- ' + points.msg : ''}`;
  } catch (e) {
    out = `Something went wrong! Phoebe and Mandu are fiddling with the cords.`;
  }
  // Send points to sheets backend
  Scoreboard.updatePoints(points.username, points.adjustment, () => {
    callback(null, {
      text: out,
      attachments: [
        // You can customize your messages with attachments.
        // See https://api.slack.com/docs/message-attachments for more info.
      ]
    });
  });
};
