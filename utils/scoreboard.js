const Sheets = require('../helpers/sheets_helper.js');

let SCOREBOARD_CACHE;

/**
 * Prints the names and majors of students in a sample spreadsheet:
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
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    const players = {};
    if (rows.length) {
      rows.map((row, index) => {
        const player = {};
        player.name = row[0];
        player.points = row[2];
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
 * Updates a user's points in sheets and calls the callback function afterwards.
 * Leverages an instance variable of the scoreboard if it has been retrieved
 * during this session to speed up the request.
 * @param {string} username User's handle in sheets
 * @param {int} mod The adjusment being made to a user's points
 * @param {Function} callback Callback function that is called after sheets write
 */
function updatePoints(username, mod, callback) {
  if (!SCOREBOARD_CACHE) {
    getScoreboard(players => {
      performUpdatePoints(players, username, mod, callback);
    });
  } else {
    performUpdatePoints(SCOREBOARD_CACHE, username, mod, callback);
  }
}

/**
 * Performer for point update. If the player's username does not exist in the
 * sheets, an error will be thrown. Always tries to modify the C column of
 * the corresponding row.
 * @param {Object} players The scoreboard object containing all of the players
 *    data.
 * @param {*} username The player's username handle in sheets.
 * @param {*} mod The adjustment to be made to a user's point total.
 * @param {*} callback The function that will be called after sheets has been executed.
 */
async function performUpdatePoints(players, username, mod, callback) {
  if (!players[username]) {
    throw new Error('Unable to find ' + username +' in Scoreboard!');
  }
  let sheets;
  try {
    sheets = await Sheets.getSheets();
  } catch (e) {
    throw new Error('Unable to intialize sheets. Something went wrong.');
  }

  const score = parseInt(players[username].points) + mod;
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
  updatePoints,
}