var GECKO_SCRIPT_VERSION = "0.6.3 Alpha"

function showVersion() {
  var versionString = "VERSION: " + GECKO_SCRIPT_VERSION;
  SpreadsheetApp.getUi().alert(versionString);
}

function generateEndpointUrl_(endpoint) {
  return "https://api.coingecko.com/api/v3/" + endpoint;
}

function getJSON_(endpoint) {
  var url = generateEndpointUrl_(endpoint);
  response = UrlFetchApp.fetch(url, { muteHttpExceptions: true })

  if (response.getResponseCode() == 200) {
    return JSON.parse(response.getContentText())
  } else {
    Logger.log(response.getResponseCode());
    Logger.log(response.getContentText());
    errorMessage = JSON.parse(response.getContentText())["error"];
    throw new Error(errorMessage);
  }
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
      var currentCell = sheet.getRange(getRefreshCounterCell_());
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

function insertGeckoScript(type, coin, currency) {
  updateCounterValue_();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currentCell = sheet.getCurrentCell();
  var geckoScript = buildGeckoScript_(type, coin, currency)
  currentCell.setValue(geckoScript);
}

function getRefreshCounterCell_() {
  return "Z9999"
}

function getCoinData_(pair) {
  values = pair.split('/');

  if(values.length != 2) {
    throw new Error("Incorrect format. Separate coin id and currency by a slash. E.g ethereum/usd");
  }

  coin_id = values[0].toLowerCase();
  currency = values[1].toLowerCase();

  urlToRequest = "coins/markets?vs_currency=" + currency;

  if (coin_id.match(/^id:/)) {
    coin_id = coin_id.match(/id:(.*)/)[1];
    urlToRequest += "&" + "ids=" + coin_id;
  } else {
    urlToRequest += "&" + "symbols=" + coin_id;
  }

  var response = getJSON_(urlToRequest);

  if (response["error"] || response.length == 0) {
    throw new Error("Invalid currency or coin")
  }

  return response[0];
}

function createTimeDrivenTriggers_() {
  ScriptApp.newTrigger('updateCounterValue_')
      .timeBased()
      .everyHours(1)
      .create();
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
