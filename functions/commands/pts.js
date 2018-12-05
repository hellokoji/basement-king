const Scoreboard = require('../../utils/scoreboard.js');

const ERROR_MESSAGE = `Something went wrong! Phoebe and Mandu are fiddling with the cords.`;
const RESTRICTED_CHANNELS = [
  'CEGN9SP0X', // #basementking
  'C1JVC6R3P', // #bot_dev
]

/**
*   Extract points query from a string.

* @param {string} text The text contents of the command
* @returns {object} An object containing data of the points query.
*/
function getPointsFromMessage(text) {
  const pattern = /(\S+)\s((-|\+)?[0-9]+)(\s(.*))?$/
  const match = text.match(pattern);
  if (match === null) {
    throw new Error('Unable to extract points from message! - \"' + text + '\"');
  }
  const points = {};

  points.username = match[1];
  points.adjustment = parseInt(match[2]);
  points.msg = match[5];

  return points;
}

/**
* /pts
*
*   Modify points command.
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
    console.log('/pts ' + text);
    let out, points;
    try {
      points = getPointsFromMessage(text);
    } catch (e) {
      callback(null, {
        text: 'Invalid format! Please follow /pts username +/-# message(optional).'
      });
      console.error(e);
      return;
    }
    try {
      out = `<@${user}>: ${points.username} ${points.adjustment > 0 ? '+':''}${points.adjustment} pts${!!points.msg ? ' -- ' + points.msg : ''}`;
      // Send points to sheets backend      
      Scoreboard.updatePoints(points.username, points.adjustment, msg => {
        callback(null, { text: msg ? msg : out });
      });
    } catch (e) {
      callback(null, { text: ERROR_MESSAGE });
      console.error(e);
    }
  } else {
    callback(null, {text: 'You are not in the right channel! Try #basementking.'});
  }
};
