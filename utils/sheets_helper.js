const fs = require('fs');
const {google} = require('googleapis');
const TOKEN_PATH = 'token.json';
const SHEET_PATH = 'sheet.json';

/**
 * @param {string} TOKEN_PATH path to file with API_KEY in it
 * @return Promise containing the google API_KEY to use with sheets.
 */
function getApiKey(TOKEN_PATH) {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, content) => {
      err ? reject('Error loading API key - ' + err)
          : resolve((JSON.parse(content)['api_key']));
    });
  });
}

/**
 * @return {!Promise<!Object>} Promise containing initialized google sheets object.
 */
async function getSheets() {
  const key = await getApiKey(TOKEN_PATH);
  const sheets = google.sheets({version: 'v4', auth: key});
  return sheets;
}

/**
 * @return {!Promise<string>} Promise containing string Google Sheets ID from SHEET_PATH
 */
function getSheetID() {
  return new Promise((resolve, reject) => {
    fs.readFile(SHEET_PATH, (err, content) => {
      err ? reject('Error loading Sheet ID - ' + err)
          : resolve((JSON.parse(content)['sheet_id']));
    })
  })
}

module.exports = {
  getSheets,
  getSheetID,
};