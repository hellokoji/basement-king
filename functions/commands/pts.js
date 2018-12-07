const Scoreboard = require('../../utils/scoreboard.js');

const ERROR_MESSAGE =
    `Something went wrong! Phoebe and Mandu are fiddling with the cords.`;
const RESTRICTED_CHANNELS = [
  'CEGN9SP0X', // #basementking
  'C1JVC6R3P', // #bot_dev
];
const PTS_REGEX = /^(\S+(,\s?\S+)*)\s((-|\+)?[0-9]+)(\s(.*))?$/;

/**
*   Extract points query from a string. Can have multiple users being modified
*   simultaneously.
*   Format is: /pts username(,username2,...) +/-# message(optional).
*
* @param {string} text The text contents of the command
* @returns {Object[]} An array containing the objects of the user with
*     username, adjustment, and message attached.
*/
function getPointsFromMessage(text) {
  const match = text.match(PTS_REGEX);
  if (match === null) {
    throw new Error('Unable to extract points from message! - \"' + text + '\"');
  }
  const users = [];
  const points = parseInt(match[3]);
  const names = match[1].replace(/\s/g, '').split(',');
  names.forEach(e => {
    if (e.length > 0) {
      const user = {};
      user.username = e;
      user.adjustment = points;
      user.msg = match[6];
      users.push(user);
    }
  });
  return users;
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
*/
module.exports = (user, channel, text = '', command = {}, botToken = null, callback) => {
  if (RESTRICTED_CHANNELS.indexOf(channel) > -1) {
    console.log('/pts ' + text);
    let out = {}, users;
    try {
      users = getPointsFromMessage(text);
      out.usernames = users.length === 1
          ? users[0].username + ' '
          : users.reduce((acc, curr) => {return acc += curr.username + ' '}, '');
      out.adjustment = users[0].adjustment;
      out.msg = users[0].msg;
    } catch (e) {
      callback(null, {
        channel: user,
        text: 'Invalid format! Please follow /pts username(,username2,...) +/-# message(optional).',
      });
      console.error(e);
      return;
    }
    try {
      // assumption is that all point totals being modified are modified with the same adjustment
      out.body = `<@${user}>: ${out.usernames}${out.adjustment > 0 ? '+':''}${out.adjustment} pts${!!out.msg ? ' -- ' + out.msg : ''}`;
      Scoreboard.getScoreboard(scoreboard => {
        Scoreboard.updatePoints(users, scoreboard, (error, scoreboard) => {
          if (error) {
            callback(null, {
              channel: user,
              text: error,
            });
            return;
          }
          Scoreboard.getScoreboardTable(scoreboard, table => {
            callback(null, { text: out.body + ' ```' + table + '```' });
          });
        });
      });
    } catch (e) {
      callback(null, {
        channel: user,
        text: ERROR_MESSAGE,
      });
      console.error(e);
    }
  } else {
    callback(null, {
      channel: user,
      text: 'You are not in the right channel! Try <#CEGN9SP0X>.',
    });
  }
};
