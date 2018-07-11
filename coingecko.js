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
  if(type == "current_price") {
    return '=COINGECKO("id:' + coin + '/' + currency + '")';
  }
}

function getSupportedCoins() {
  return getJSON_("coins/list");
}

function insertGeckoScript(type, coin, currency) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currentCell = sheet.getCurrentCell();
  var geckoScript = buildGeckoScript_(type, coin, currency)
  currentCell.setValue(geckoScript);
}

/**
 * Returns the price of the specified cryptocurrency pair
 *
 * @param {pair} The currency pair. E.g "ethereum/USD", "bitcoin/USD"
 * @return The current price of specified cryptocurrency pair rounded
 * @customfunction
 */
function COINGECKO(pair) {
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
  } else {
    var price = response[0]["current_price"]
    return price;
  }
}
