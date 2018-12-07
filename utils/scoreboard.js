const Sheets = require('../helpers/sheets_helper.js');
const cTable = require('console.table');

/**
 * Generates an object of the current state of the scoreboard in the sheets.
 * Calls the callback function with the parameter of the object.
 * 
 * @see https://docs.google.com/spreadsheets/d/1Bl_imBpmXZcyvCUVTPwuUtceZy8A5Ly41HlVjJ_5GQI/edit
 * @param callback function to call after successfully retrieving the scoreboard. Passes player scores.
 */
async function getScoreboard(callback) {
  let sheets;
  try {
    sheets = await Sheets.getSheets();
  } catch (e) {
    throw new Error('Unable to intialize sheets. Something went wrong.');
  }
  sheets.spreadsheets.values.get({
    spreadsheetId: await Sheets.getSheetID(),
    range: 'Scoreboard!A2:C',
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const rows = res.data.values;
    const players = {};
    if (rows.length) {
      rows.map((row, index) => {
        const player = {};
        player.name = row[0];
        player.points = row[2] ? row[2] : 0;
        player.row = row;
        player.rowNum = index + 2;
        players[row[1]] = player;
      });
    } else {
      console.log('No data found.');
    }
    SCOREBOARD_CACHE = players;
    callback(players);
  });
}

/**
 * Generates the out table string of the scoreboard object given in the players
 * parameter. Executes the callback parameter with the table string as a
 * parameter.
 * 
 * @param {Object} players Object representation of the scoreboard
 * @param {Function<undefined>} callback Function to call after the table
 *    string is generated.
 */
function getScoreboardTable(players, callback) {
  const out = [];
  const usernames = Object.keys(players);
  usernames.sort((username1, username2) => {
    return players[username2].points - players[username1].points
  });
  usernames.forEach(player => {
    if (players.hasOwnProperty(player)) {
      out.push({
        Username: player,
        Points: players[player].points,
      });
    }
  });
  const table = cTable.getTable(out).slice(0,-2);
  callback(table);
}

/**
 * Updates a user's points in sheets and calls the callback function
 * afterwards. First calls getScoreboard to grab the current state of the
 * sheets.
 * 
 * @param {Object[]} users Array of user objects to be modified
 * @param {Object} scoreboard scoreboard object holding the current scores
 * @param {Function<undefined>} callback function that is called after point
 *    updates have been completed. First parameter is an error if present, the
 *    second is the newly modified scoreboard object.
 */
async function updatePoints(users, scoreboard, callback) {
  const promises = [];
  try {
    users.forEach(user => {
      promises.push(new Promise((resolve,reject) => {
        if (!scoreboard[user.username]) {
          // NOTE: potential race here if usernames are not found before sheets
          // update is performed.
          reject('Unable to find ' + user.username + ' in Scoreboard!');
        }
        scoreboard[user.username].points =
            parseInt(scoreboard[user.username].points) + user.adjustment;
        performUpdatePoints(scoreboard, user.username, () => {
          resolve();
        });
      }));
    });
    await Promise.all(promises);
    callback(null, scoreboard);
  } catch (e) {
    console.error(e);
    callback(e);
  }
}

/**
 * Performer for point update. If the player's username does not exist in the
 * sheets, an error will be thrown. Always tries to modify the C column of
 * the corresponding row.
 * 
 * @param {Object} players The scoreboard object containing all of the players
 *    data.
 * @param {string} username The player's username handle in sheets.
 * @param {Function<undefined>} callback The function that will be called after
 *    sheets has been executed.
 */
async function performUpdatePoints(players, username, callback) {
  let sheets;
  try {
    sheets = await Sheets.getSheets();
  } catch (e) {
    throw new Error('Unable to intialize sheets. Something went wrong.');
  }

  const score = players[username].points;
  // console.log(players, username);
  sheets.spreadsheets.values.update({
    spreadsheetId: await Sheets.getSheetID(),
    range: 'Scoreboard!C' + players[username].rowNum,
    includeValuesInResponse: true,
    valueInputOption: 'RAW',
    resource: { values: [[score]] },
    auth: await Sheets.getAuthClient(),
  }, (err, res) => {
    if (err) throw new Error('The API returned an error: ' + err);
    callback();
  });
}

module.exports = {
  getScoreboard,
  getScoreboardTable,
  updatePoints,
}