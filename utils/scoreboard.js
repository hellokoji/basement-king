const fs = require('fs');
const {google} = require('googleapis');

// The file token.json stores the API key to call the Sheets APIs.
const TOKEN_PATH = 'token.json';
let SCOREBOARD_CACHE;
const SPREADSHEET_ID = '1Bl_imBpmXZcyvCUVTPwuUtceZy8A5Ly41HlVjJ_5GQI';
let API_KEY_RESOLVE, API_KEY_REJECT;
const API_KEY_PROMISE = new Promise((resolve, reject) => {
  API_KEY_RESOLVE = resolve;
  API_KEY_REJECT = reject;
});

// Load client secrets from a local file.
fs.readFile(TOKEN_PATH, (err, content) => {
  if (err) return API_KEY_REJECT('Error loading API key: ' + err);
  const json = JSON.parse(content);
  API_KEY = json.api_key;
  API_KEY_RESOLVE(API_KEY);
});

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1Bl_imBpmXZcyvCUVTPwuUtceZy8A5Ly41HlVjJ_5GQI/edit
 * @param callback function to call after successfully retrieving the scoreboard. Passes player scores.
 */
async function getScoreboard(callback) {
  const key = await API_KEY_PROMISE;
  const sheets = google.sheets({version: 'v4', auth: key});
  sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
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

module.exports = {
    getScoreboard,
}