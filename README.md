# coingecko-gsheet-addon
Documentation for the CoinGecko formula on Google Sheet
# to install
1. On web browser : bitly.com/coingeckoplugin
2. On spreadsheet : 
  
   a. Go to "add-ons" menu, and click "Get add-ons". On the Add-ons panel, search for "CoinGecko" or “CoinGecko - Cryptocurrency Data”,           click    on "+FREE" to install it. 
   
   b. Choose under which account you want to install the Add-on.
   
   c. CoinGecko - Cryptocurrency Data needs the following permissions to run ; 
        - View and manage spreadsheets that this application has been installed in.
        - Display and run third-party web content in prompts and sidebars inside Google applications.
        - Connect to an external service. 
   
   d. Click on “Allow”.

3. Make sure the add-on is activated in your sheet: Go to Add-on > CoinGecko - Cryptocurrency Data  > Help Click on View in store , then click on Manage and check Use in this document:

4. From there the =coingecko() function is available on any new spreadsheet you create.

# Using the Add-on
There are 2 ways to use this Spreadsheet addon 

#1 Direct Formula (To track price data) : =COINGECKO("BTC/USD") 

#2 User Interface Click "Add-ons" > "CoinGecko - Cryptocurrency Data" > "Add Coin Data"

=COINGECKO("BTC/USD") 

=COINGECKO_MARKETCAP("BTC/USD")

=COINGECKO_TRADING_VOLUME("BTC/USD")

