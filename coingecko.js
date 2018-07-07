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

function getSupportedCoins() {
  return getJSON_("coins/list");
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

  var response = getJSON_("coins/" + coin_id);

  var current_price_list = response["market_data"]["current_price"];
  price = current_price_list[currency]

  if (price == null || price == undefined) {
     throw new Error("Invalid currency specified. " + currency + " is not a valid currency")
  }

  return price;
}