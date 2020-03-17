namespace Marketman {

    export class Test {
        buyerApi: BuyerApi;
        buyerNameContains: string;

        constructor(buyerApi?: BuyerApi) {
            if (buyerApi) {
                this.buyerApi = buyerApi;
            } else {
                this.buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
            }
            this.buyerNameContains = "Paddington"; // Change that to the buyer you require
        }

        testAll() {
            this.getToken();
            this.requestTokenDetails();
            this.inventoryCounts();
            this.requestTokenDetails();
        }

        getToken() {
            var initialToken = this.buyerApi.getToken();
            var initialTokenExpiry = initialToken.expiryDate;
            Logger.log(initialToken);
            var secondaryToken = this.buyerApi.getToken();
            Logger.log(secondaryToken);
            if (initialToken.equals(secondaryToken)) {
                Logger.log("Success: Double token request was avoided");
            } else {
                Logger.log("Fail: Double token request was not avoided");
            }
            var forceToken = this.buyerApi.getToken(true);
            if (!forceToken.equals(initialToken)) {
                Logger.log("Success: Force worked");
            } else {
                Logger.log("Fail: Foce did not work");
            }
        }

        testBuyer(): Buyer {
            return this.buyerApi.buyersContaining(this.buyerNameContains)[0] || this.buyerApi.defaultBuyer();
        }

        inventoryCounts() {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 2));
            var toDate = new Date();
            var getLineDetails = true;

            var inventoryResponse = this.buyerApi.getInventoryCounts(fromDate, toDate, getLineDetails, this.testBuyer());
            Logger.log("Token: " + this.buyerApi.getToken());
            Logger.log("End Point: Inventory Counts");
            Logger.log("--- RESPONSE ----\n");
            Logger.log(inventoryResponse.inventoryCounts.length);
            Logger.log(JSON.stringify(inventoryResponse));


            Logger.log("--- RESPONSE ARRAY----\n");

            Logger.log(JSON.stringify(inventoryResponse.inventoryCountsArray()));

            //Logger.log(JSON.stringify(response));
        }

        inventoryCountsWrite() {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 2));
            var toDate = new Date();
            var getLineDetails = true;

            var inventoryResponse = this.buyerApi.getInventoryCounts(fromDate, toDate, getLineDetails, this.testBuyer());

            var values = inventoryResponse.inventoryCountsArray();
            var headers = Marketman.InventoryCount.headers();

            Logger.log(headers);
            Logger.log(values);

            var sheetData = new SheetHeadedData("ASTest", new SSHeadedRange(0,0,0,0,0,0));

            sheetData.headers = headers;
            sheetData.values = values;
            sheetData.writeHeaders();
            sheetData.writeValues();
        }

        actualVsTheoritical() {
            var startDate = new Date();
            startDate.setUTCFullYear(2020, 1, 13);
            var endDate = new Date();
            endDate.setUTCFullYear(2020,1,20);

            var response = this.buyerApi.getActualVsTheoritical(startDate, Marketman.InventoryTime.EndOfDay, endDate, Marketman.InventoryTime.EndOfDay, this.testBuyer());

            var values = response.toFlatArray();
            var headers = Marketman.AVTItem.headers();

            Logger.log(headers);
            Logger.log(values);

            var sheetData = new SheetHeadedData("ASTest", new SSHeadedRange(0,0,0,0,0,0));

            sheetData.headers = headers;
            sheetData.values = values;
            sheetData.writeHeaders();
            sheetData.writeValues();

        }

        requestTokenDetails() {
            var response = this.buyerApi.getTokenDetails();
            Logger.log("Token: " + this.buyerApi.getToken());
            Logger.log("End Point: Token Details");
            Logger.log("--- RESPONSE ----\n");
            Logger.log(response);
        }
    }
}

function testAll() {
    var test = new Marketman.Test();
    test.testAll();
}

function testToken() {
    var test = new Marketman.Test();
    test.getToken();
}

function testInventory() {
    var test = new Marketman.Test();
    test.inventoryCounts();
}

function testInventoryWrite() {
    var test = new Marketman.Test();
    test.inventoryCountsWrite();
}

function testActiualVsTheoritical() {
    var test = new Marketman.Test();
    test.actualVsTheoritical();
}

function testDates() {
    // Get the variables needed
    var sheet = SpreadsheetApp.getActiveSheet();
    var fromDate = sheet.getRange('C2').getValue();
    var fromDateStart = (sheet.getRange('D2').getValue() == "Start");
    var toDate = sheet.getRange('F2').getValue();
    var toDateStart = (sheet.getRange('G2').getValue() == "Start");
    var buyerContains = sheet.getRange('I2').getValue();
    var fromTime =  Marketman.InventoryTime.EndOfDay;
    if (fromDateStart) {
        fromTime = Marketman.InventoryTime.StartOfDay;
    }
    var toTime =  Marketman.InventoryTime.EndOfDay;
    if (toDateStart) {
        toTime = Marketman.InventoryTime.StartOfDay;
    }
    var fromDateString = Marketman.convertInventoryDateToString(fromDate, fromTime);
    var toDateString = Marketman.convertInventoryDateToString(toDate, toTime);

    Logger.log(fromDateString);
    Logger.log(toDateString);

}