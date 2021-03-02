namespace Marketman {
    export class SingleProductCalculator {
        countDates = new Marketman.InventoryCountDates();
        buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
        spreadsheetName = "Single Product";

        lastItemInventoryKey = "Latest Item Inventory";
        searchStartKey = "open";
        searchEndKey = "close";
        productIdKey = "productID";

        summaryData = new SheetHeadedData(this.spreadsheetName, new SSHeadedRange(0, 0, 0, 26, 4, 6));
        countData = new SheetHeadedData(this.spreadsheetName, new SSHeadedRange(0, 28, 0, 0, 4, 6));

        constructor() {
            this.summaryData.getValues();
            this.countData.getValues();
        }

        excludedKey(key: String) {
            if (key.endsWith(this.searchStartKey) || key.endsWith(this.searchEndKey) || key.endsWith("isSuccess") || key.endsWith("errorMessage")) {
                return true;
            }
            return false;
        }

        resetDataSpreadsheet() {
            // Delete summary data and update product list
            SpreadsheetApp.getActiveSpreadsheet().toast("Updating product names and reseting all values.", "Reseting Values");
            // Get Product Names from Summary Spreadsheet and Store them to newValues 
            this.countData.clearValues();
            // Write New Product Names to Summary Data
            this.countData.getValues();
        }

        updateSingleProductSpreadsheet() {
            this.resetDataSpreadsheet();

            // Update With New Data
            SpreadsheetApp.getActiveSpreadsheet().toast("Getting New Data", "Updating");
            var i = 0;
            this.countData.values.forEach(element => {
                var summaryElement = this.summaryData.values[i];
                // Get Product Name
                var productId = summaryElement[this.productIdKey];
                // Get Dates
                var startDate = summaryElement[this.searchStartKey];
                var endDate = summaryElement[this.searchEndKey];
                //Logger.log("===== Product Name =====" + productId + " Start Date " + startDate + " End Date " + endDate);
                if (!startDate || !endDate) {
                    return;
                }
                var avt = Marketman.InventoryCalculator.avtForId(this.buyerApi, productId, startDate, endDate);
                if (!avt) {
                    return;
                }

                var flatAvt = avt.toFlatDictionary();
                //Logger.log("===== flat Avt =====" + flatAvt);
                Object.keys(element).forEach(key => {
                    element[key] = flatAvt[key];
                });
                i++;

            });
            this.countData.writeValues();
        }
    }
}

