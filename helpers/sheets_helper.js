const fs = require('fs');
const {google} = require('googleapis');
const TOKEN_PATH = 'token.json';
const SHEET_PATH = 'sheet.json';
const privatekey = require('../service_account.json');

/**
 * @param {string} TOKEN_PATH path to file with API_KEY in it
 * @return Promise containing the google API_KEY to use with sheets.
 */
function getApiKey() {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, content) => {
      err ? reject('Error loading API key - ' + err)
          : resolve((JSON.parse(content)['api_key']));
    });
  });
}

/**
 * @return {Object} object containing an authorized google client as a jwt.
 */
function getAuthClient() {
  // configure a JWT auth client
  let jwtClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    [ 'https://www.googleapis.com/auth/spreadsheets' ]);
  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Successfully connected!");
    }
  });
  return jwtClient;
}

/**
 * @return {!Promise<!Object>} Promise containing initialized google sheets object.
 */
async function getSheets() {
  const key = await getApiKey();
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
  getApiKey,
  getAuthClient,
  getSheets,
  getSheetID,
};