var GECKO_SCRIPT_VERSION = "0.6.9 Alpha";
var RETRY_SLEEP_PERIODS = [5000, 10000, 20000, 30000, 60000, 120000];

function showVersion() {
  var versionString = "VERSION: " + GECKO_SCRIPT_VERSION;
  SpreadsheetApp.getUi().alert(versionString);
}

function generateEndpointUrl_(endpoint) {
  return "https://api.coingecko.com/api/v3/" + endpoint;
}

function getJSON_(endpoint) {
  var url = generateEndpointUrl_(endpoint);
  retryCount = 1;
  maxRetries = RETRY_SLEEP_PERIODS.length

  while (retryCount <= maxRetries) {
    response = UrlFetchApp.fetch(url, { muteHttpExceptions: true })

    if (response.getResponseCode() == 200) {
      return JSON.parse(response.getContentText())
    } else {
      timeToSleep = RETRY_SLEEP_PERIODS[retryCount - 1]
      console.log("Failed to get response. Sleeping for " + timeToSleep)
      Utilities.sleep(timeToSleep);
      retryCount += 1;
    }
  }

  retryFailureMessage = "Tried for " + maxRetries + " times but failed";
  console.error(retryFailureMessage)
  throw new Error(retryFailureMessage);
}

function buildGeckoScript_(type, coin, currency) {
  refreshCounterCell = getRefreshCounterCell_();
  functionName = "=COINGECKO";

  if(type == "current_price") {
    functionName = "=COINGECKO";
  } else if (type == "market_cap") {
    functionName = "=COINGECKO_MARKETCAP";
  } else if (type == "total_volume") {
    functionName = "=COINGECKO_TRADING_VOLUME";
  }

  return functionName + '("id:' + coin + '/' + currency + '", $' + refreshCounterCell + ')';
}

function getSupportedCoins() {
  return getJSON_("coins/list");
}

function updateCounterValue_() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  try {
    for(var i=0; i < sheets.length; i++) {
      var sheet = sheets[i];
      var currentCell = sheet.getRange(getRefreshCounterCell_(sheet));
      currentValue = currentCell.getValue() || 1;
      newValue = currentValue += 1;
      currentCell.setValue(newValue);
      message = "Coingecko: Please do not change this cell " +
                 "as it will affect the refreshing of price data"
      currentCell.setNote(message)
    }
  }
  catch (error) {
    message = error.message
    if (message.match(/^This action would increase the number of cells in the workbook/)) {
      throw new Error("There are too many columns in one of the sheets. Please delete any unwanted columns and try again");
    } else {
      throw error;
    }
  }
}

function updateExistingUnmarkedCells_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  patchFormulasForSheet(sheet)
}

function patchFormulasForSheet(sheet) {
  var range = sheet.getDataRange();
  var formulas = range.getFormulas();

  for (var i = 0; i < formulas.length; i++) {
    for (var j = 0; j < formulas[i].length; j++) {
      formula = formulas[i][j]

      if (shouldPatchGeckoFormula(formula)) {
        patchedFormula = patchFormula(formula);
        cell = range.getCell(i + 1, j + 1);
        cell.setValue(patchedFormula);
      }
    }
  }
}

function shouldPatchGeckoFormula(formula) {
  return formula && matchesGeckoFormula(formula) && !isFormulaPatched(formula);
}

function matchesGeckoFormula(formula) {
  return formula.match(/^=COINGECKO/);
}

function isFormulaPatched(formula) {
  return formula.indexOf(getRefreshCounterCell_()) != -1;
}

function patchFormula(formula) {
  return formula.replace(/^(=COINGECKO[\w]*)\("(.*)".*\)/, "$1(\"$2\", $" + getRefreshCounterCell_() + ")");
}

function insertGeckoScript(type, coin, currency) {
  updateCounterValue_();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currentCell = sheet.getCurrentCell();
  var geckoScript = buildGeckoScript_(type, coin, currency)
  currentCell.setValue(geckoScript);
}

function getRefreshCounterCell_(sheet) {
  sheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  lastRowIndex = sheet.getMaxRows()
  lastColumnIndex = sheet.getMaxColumns()

  var range = sheet.getRange(lastRowIndex, lastColumnIndex);
  return range.getA1Notation();
}

function getValueFromServer_(idOrSymbol, currency) {
  urlToRequest = "coins/markets?vs_currency=" + currency;

  if (idOrSymbol.match(/^id:/)) {
    idOrSymbol = idOrSymbol.match(/id:(.*)/)[1];
    urlToRequest += "&" + "ids=" + idOrSymbol;
  } else {
    urlToRequest += "&" + "symbols=" + idOrSymbol;
  }

  var response = getJSON_(urlToRequest);

  if (response["error"] || response.length == 0) {
    throw new Error("Invalid currency or coin")
  }

  console.log("Response for " + idOrSymbol + " " + currency + " was requested from the server");

  response = response[0];
  cacheResponse_(idOrSymbol, currency, response);
  return response;
}

function getCoinData_(pair) {
  values = pair.split('/');

  if(values.length != 2) {
    throw new Error("Incorrect format. Separate coin id and currency by a slash. E.g ethereum/usd");
  }

  coin_id = values[0].toLowerCase();
  currency = values[1].toLowerCase();

  valueFromCache = getValueFromCache_(coin_id, currency)

  if (valueFromCache) {
    console.log("Response for " + pair + " was served from the cache!");
    return valueFromCache;
  } else {
    return getValueFromServer_(coin_id, currency);
  }
}

/**
 * Returns the price of the specified cryptocurrency pair
 *
 * @param {pair} The currency pair. E.g "ethereum/USD", "bitcoin/USD"
 * @return The current price of specified cryptocurrency pair rounded
 * @customfunction
 */
function COINGECKO(pair) {
  coinData = getCoinData_(pair)
  return coinData["current_price"];
}

/**
 * Returns the market cap of the specified cryptocurrency pair
 *
 * @param {pair} The currency pair. E.g "ethereum/USD", "bitcoin/USD"
 * @return The market cap of specified cryptocurrency pair rounded
 * @customfunction
 */
function COINGECKO_MARKETCAP(pair) {
  coinData = getCoinData_(pair)
  return coinData["market_cap"];
}

/**
 * Returns the trading volume of the specified cryptocurrency pair
 *
 * @param {pair} The currency pair. E.g "ethereum/USD", "bitcoin/USD"
 * @return The trading volume of specified cryptocurrency pair rounded
 * @customfunction
 */
function COINGECKO_TRADING_VOLUME(pair) {
  coinData = getCoinData_(pair)
  return coinData["total_volume"];
}
