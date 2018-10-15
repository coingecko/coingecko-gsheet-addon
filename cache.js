function getCacheKey(idOrSymbol, currency) {
  if (idOrSymbol.match(/^id:/)) {
    id = idOrSymbol.match(/id:(.*)/)[1];
  } else {
    id = idOrSymbol;
  }
  return id + "_" + currency;
}

function cacheResponse_(idOrSymbol, currency, serverResponse) {
  var scriptCache = CacheService.getScriptCache();
  var key = getCacheKey(idOrSymbol, currency);
  console.log("Caching response for " + key);

  dataToCache = JSON.stringify(serverResponse);

  cacheForSeconds = 120;
  scriptCache.put(key, dataToCache, cacheForSeconds);
}

function getValueFromCache_(idOrSymbol, currency) {
  var scriptCache = CacheService.getScriptCache();
  var cacheKey = getCacheKey(idOrSymbol, currency);

  dataInCache = scriptCache.get(cacheKey);

  if (dataInCache) {
    return JSON.parse(dataInCache);
  }
}

function runGlobablCache_() {
  var allCoinData = getJSON_("coins")

  var globalCache = {}

  allCoinData.forEach(function(coinData) {
    var marketData = coinData["market_data"];
    var coinId = coinData["id"];

    if (!globalCache[coinId]) {
      globalCache[coinId] = {};
    }

    for (var marketDatumKey in marketData) {
      for (var currencyKey in marketData[marketDatumKey]) {
        value = marketData[marketDatumKey][currencyKey];

        if (!globalCache[coinId][currencyKey]) {
          globalCache[coinId][currencyKey] = {};
        }

        globalCache[coinId][currencyKey][marketDatumKey] = value;
      }
    }
  });

  cacheGlobalData_(globalCache);
}

function cacheGlobalData_(globalCache) {
  valuesToCache = {}

  for (var coin in globalCache) {
    for (var currency in globalCache[coin]) {
      var dataToCache = globalCache[coin][currency];
      cacheKey = getCacheKey(coin, currency);
      valuesToCache[cacheKey] = JSON.stringify(dataToCache);
    }
  }

  var scriptCache = CacheService.getScriptCache();
  cacheForSeconds = 120;
  scriptCache.putAll(valuesToCache, cacheForSeconds)
}
