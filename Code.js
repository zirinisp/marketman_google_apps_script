function updateInventoryItemsAndCounts() {
    var buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
    getInventory("Inventory Items", buyerApi);
    getInventoryCounts("Inventory Counts", buyerApi);
}

function getInventory(sheetName, buyerApi) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    var fromDate = sheet.getRange('C2').getValue();
    var toDate = sheet.getRange('E2').getValue();
    var getLineDetails = sheet.getRange('G2').getValue();
    var buyerContains = sheet.getRange('I2').getValue();
    var buyer  = buyerApi.buyersContaining(buyerContains)[0];
    // TODO: Type Check
    // TODO: check if buyer exists

    var inventoryResponse = buyerApi.getInventoryCounts(fromDate, toDate, getLineDetails, buyer);

    var values = inventoryResponse.inventoryCountsArray();
    var headers = Marketman.InventoryCount.headers();

    Logger.log(headers);
    Logger.log(values);

    var sheetData = new SheetHeadedData(sheet.getName(), new SSHeadedRange(0,0,0,0,4,5));

    sheetData.values = values;
    sheetData.clearValues();
    sheetData.writeValues(false);
}

function getInventoryButton() {
    var buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);

    // Get the variables needed
    var sheetName = SpreadsheetApp.getActiveSheet().sheetName;
    getInventory(sheetName, buyerApi);
}

function getActualVsTheoritical(sheetName, buyerApi) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    var fromDate = sheet.getRange('C2').getValue();
    var fromDateStart = (sheet.getRange('D2').getValue() == "Start");
    var toDate = sheet.getRange('F2').getValue();
    var toDateStart = (sheet.getRange('G2').getValue() == "Start");
    var buyerContains = sheet.getRange('I2').getValue();
    var buyer  = buyerApi.buyersContaining(buyerContains)[0];
    var fromTime =  Marketman.InventoryTime.EndOfDay;
    if (fromDateStart) {
        fromTime = Marketman.InventoryTime.StartOfDay;
    }
    var toTime =  Marketman.InventoryTime.EndOfDay;
    if (toDateStart) {
        toTime = Marketman.InventoryTime.StartOfDay;
    }


    // TODO: Type Check
    // TODO: check if buyer exists
    var response = buyerApi.getActualVsTheoritical(fromDate, fromTime, toDate, toTime, buyer);

    var values = response.toFlatArray();
    var headers = Marketman.AVTItem.headers();

    Logger.log(headers);
    Logger.log(values);

    var sheetData = new SheetHeadedData(sheet.getName(), new SSHeadedRange(0,0,0,0,4,5));

    sheetData.values = values;
    sheetData.clearValues();
    sheetData.writeValues(false);
}

function getActualVsTheoriticalButton() {
    var buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);

    // Get the variables needed
    var sheetName = SpreadsheetApp.getActiveSheet().sheetName;
    getActualVsTheoritical(sheetName, buyerApi);
}

function getInventoryItems(sheetName, buyerApi) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    var getDeleted = sheet.getRange('C2').getValue();
    var itemIDsString = sheet.getRange('E2').getValue();
    var buyerContains = sheet.getRange('G2').getValue();

    var itemIDs = null;
    if (itemIDsString != "") {
        itemIDs = itemIDsString.split(",");
    }

    var buyer  = buyerApi.buyersContaining(buyerContains)[0];

    // TODO: Type Check
    // TODO: check if buyer exists
    var response = buyerApi.getInventoryItems(buyer, getDeleted, itemIDs);

    var values = response.itemsArray();
    var headers = Marketman.PurchaseItem.headers();

    Logger.log(headers);
    Logger.log(values);

    var sheetData = new SheetHeadedData(sheet.getName(), new SSHeadedRange(0,0,0,0,4,5));

    sheetData.values = values;
    sheetData.clearValues();
    sheetData.writeValues(false);

}
function getInventoryItemsButton() {
    var buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);

    // Get the variables needed
    var sheetName = SpreadsheetApp.getActiveSheet().sheetName;
    getInventoryItems(sheetName, buyerApi);
}
