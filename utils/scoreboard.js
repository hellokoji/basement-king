const Sheets = require('./sheets_helper.js');

// The file token.json stores the API key to call the Sheets APIs.
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

// function updatePoints(callback) {
//   if (!SCOREBOARD_CACHE) {
//     getScoreboard(players => {

//     })
//   }
// }

async function performUpdatePoints(players) {
  let sheets;
  try {
    sheets = await Sheets.getSheets();
  } catch (e) {
    throw new Error('Unable to intialize sheets. Something went wrong.');
  }
  // sheets.spreadsheets.values.get({
  //   spreadsheetId: await Sheets.getSheetID(),
  //   range: 'Scoreboard!A2:C',
  // }, (err, res) => {
  //   if (err) return console.log('The API returned an error: ' + err);
  //   callback(players);
  // });
}

module.exports = {
    getScoreboard,
}