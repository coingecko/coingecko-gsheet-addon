function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function getSidebarHtml() {
  output = HtmlService.createTemplateFromFile('coingecko_sidebar').evaluate();
  output.setTitle('Coingecko');
  return output;
}

/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Add Coin Data', 'showSidebar')
      .addItem('Refresh', 'refreshData')
      .addSeparator()
      .addItem('Version', 'showVersion')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
  var ui = getSidebarHtml();
  SpreadsheetApp.getUi().showSidebar(ui);
}

function refreshData() {
  updateCounterValue_();
  updateExistingUnmarkedCells_()
}
