namespace Marketman {
    export class InventoryCalculator {
        countDates = new Marketman.InventoryCountDates();
        buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
        dataSpreadsheetName = "Summary Data";
        summarySpreadsheetName = "Summary";

        lastItemInventoryKey = "Latest Item Inventory";
        searchStartKey = "searchStart";
        searchEndKey = "searchEnd";
        productIdKey = "productID";

        countData = new SheetHeadedData(this.dataSpreadsheetName, new SSHeadedRange(0, 0, 0, 0, 4, 6));
        summaryData = new SheetHeadedData(this.summarySpreadsheetName, new SSHeadedRange(0, 0, 0, 0, 3, 5));

        constructor() {
            this.countData.getValues();
        }

        avtIntervalFor(productName: string, dayInterval: number, date: Date = null) : AVTItem {
            var endDate: Date;
            if (date == null) {
                endDate = this.countDates.lastDateFor(productName);
            } else {
                endDate = this.countDates.countDateBefore(productName, date);
            }
            if (!endDate) {
                return null;
            }
            var startDate = new Date();
            startDate = getDaysAgo(endDate, dayInterval);
            startDate = this.countDates.countDateBefore(productName, startDate);
            return InventoryCalculator.avtForName(this.buyerApi, productName, startDate, endDate);
        }

        static avtForName(buyerApi: BuyerApi, productName: string, startDate: Date, endDate: Date) : AVTItem {
            if (!startDate || !endDate) {
                return null;
            }
            var mmStartDate = Marketman.InventoryDate.fromDate(startDate);
            var mmEndDate = Marketman.InventoryDate.fromDate(endDate);

            var avt = buyerApi.getActualVsTheoritical(mmStartDate, mmEndDate, buyerApi.firstBuyerContaining("Paddington"));
            var item = avt.itemForName(productName);
            return item;            
        }

        static avtForId(buyerApi: BuyerApi, productId: string, startDate: Date, endDate: Date) : AVTItem {
            if (!startDate || !endDate) {
                return null;
            }
            var mmStartDate = Marketman.InventoryDate.fromDate(startDate);
            var mmEndDate = Marketman.InventoryDate.fromDate(endDate);

            var avt = buyerApi.getActualVsTheoritical(mmStartDate, mmEndDate, buyerApi.firstBuyerContaining("Paddington"));
            var item = avt.itemWithID(productId);
            return item;            
        }

        excludedKey(key: String) {
            if (key.endsWith(this.searchStartKey) || key.endsWith(this.searchEndKey) || key.endsWith("isSuccess") || key.endsWith("errorMessage")) {
                return true;
            }
            return false;
        }

        resetSummaryDataSpreadsheet() {
            // Delete summary data and update product list
            SpreadsheetApp.getActiveSpreadsheet().toast("Updating product names and reseting all values.","Reseting Values");
            // Get Product Names from Summary Spreadsheet and Store them to newValues 
            var newValues: [{ [index: string]: any }] = [{}];
            this.summaryData.getValues();
            this.summaryData.values.forEach(element => {
                var productName = element["Product Name"];
                if (productName.length > 0) {
                    var newValue = { "Product Name" : productName }
                    newValues.push(newValue);
                }
            });
            this.countData.clearValues();
            // Write New Product Names to Summary Data
            this.countData.values = newValues;
            this.countData.writeValues();
            this.countData.getValues();
        }

        updateSummaryDataSpreadsheet() {
            // Reset Current Data
            this.resetSummaryDataSpreadsheet();
            
            // Update With New Data
            SpreadsheetApp.getActiveSpreadsheet().toast("Getting New Data","Updating");
            var intervalDays = [6,13,30,60];
            this.countData.values.forEach(element => {
                // Get Product Name
                var productName = element["Product Name"];
                // Get Last Inventory Date
                var endDate = this.countDates.lastDateFor(productName);
                //Logger.log("===== Product Name ====="+productName+" End Date "+endDate);
                if (!endDate) {
                    Object.keys(element).forEach(key => {
                        if (key[1] == "-") {
                            element[key] = "";
                        }
                    });  
                    element[this.lastItemInventoryKey] = "";
                    return;
                }
                // Store Last Inventory Date
                element[this.lastItemInventoryKey] = endDate;
                var i = 1;
                var avts: { [id: string]: any }[] = [];
                // Get avt for each interval
                intervalDays.forEach(intervalDay => {
                    var startDate = new Date();
                    startDate = getDaysAgo(endDate, intervalDay);
                    startDate = this.countDates.countDateBefore(productName, startDate);
                    element[i+"-"+this.searchStartKey] = startDate;
                    element[i+"-"+this.searchEndKey] = endDate;
                    
                    var avt = InventoryCalculator.avtForName(this.buyerApi, productName, startDate, endDate);
                    if (avt) {
                        var flatAvt = avt.toFlatDictionary();
                        //Logger.log(productName+" "+startDate+" - "+endDate);
                        //Logger.log(flatAvt);
                        avts[i-1] = flatAvt;
                    } else {
                        //Logger.log(productName+" "+startDate+" - "+endDate);
                        //Logger.log("Found Nothing");
                        avts[i-1] = {};
                    }
                    i++;
                });
                //Logger.log("-----avts----");
                //Logger.log(avts);
                Object.keys(element).forEach(key => {
                    //Logger.log("Starting with "+key);

                    if (key[1] != "-" || isNaN(+key[0])) {
                        return;
                    }
                    var i : number = +key[0];
                    var avt = avts[i-1];
                    if (!avt) {
                        if (!this.excludedKey(key)) {
                            element[key] = "";
                        }
                        return;
                    }
                    var avtKey = key.substr(2, key.length -2);
                    var value = avt[avtKey];
                    if (value) {
                        element[key] = value;
                        //Logger.log(key+" = "+value)
                    } else {
                        if (!this.excludedKey(key)) {
                            element[key] = "";
                        }
                    }
                });    
            });
            this.countData.writeValues();
        }

    }

    export class InventoryCountDates {
        countData = new SheetHeadedData("Inventory Counts", new SSHeadedRange(0, 0, 0, 0, 4, 5));
        productCounts : { [id: string]: Date[] } = {};

        constructor() {
            this.update();
        }

        update() {
            this.countData.getValues();
            var dateKey = "countDateUTC";
            var productNameKey = "item.itemName";
            var values = this.countData.values;
            var countDates: Date[] = [];
            values.forEach(value => {
                var date: Date = value[dateKey];
                var valueProductName = value[productNameKey];
                if (this.productCounts[valueProductName]) {
                    this.productCounts[valueProductName].push(date);
                } else {
                    this.productCounts[valueProductName] = [date];
                }
            });
            if (countDates.length == 0) {
                return null;
            }
            return countDates;    
        }

        countDatesFor(productName: string) : Date[] {
            return this.productCounts[productName];
        }

        sortedCountDatesFor(productName: string) : Date[] {
            var countDates = this.countDatesFor(productName).sort((a, b) => a.getTime() - b.getTime());
            return countDates;
        }

        lastDateFor(productName: string) : Date {
            var countDates = this.countDatesFor(productName);
            if (!countDates || countDates.length == 0) {
                return null;
            }
            var lastDate = countDates[0];
            countDates.forEach(date => {
                if (date > lastDate) {
                    lastDate = date;
                }
            });
            return lastDate;
        }
        
        countDateBefore(productName: string, date: Date) {
            var sortedDates = this.sortedCountDatesFor(productName);
            if (sortedDates.length == 0) {
                return null;
            }
            var returnDate: Date = null;
            sortedDates.forEach(currentDate => {
                if (currentDate <= date) {
                    returnDate = currentDate;
                    return;
                }
            });
            return returnDate;
        }
    }
}

function getDaysAgo(date: Date, daysAgo: number) {
    var newDate = new Date(date);
    newDate.setDate(date.getDate()-daysAgo);
    Logger.log(date+" - "+daysAgo+" = "+newDate);
    return newDate;
};

function testCountDates() {
    var countDates = new Marketman.InventoryCountDates();
    var productCounts = countDates.productCounts;
    Logger.log(productCounts);
}

function testLastCountDates() {
    var countDates = new Marketman.InventoryCountDates();
    var lastDate = countDates.lastDateFor("PORK NECK SOUVLAKI MARINATED 100gr 6.4gr");
    Logger.log(lastDate);
}

function testAvtSingleItem() {
    var calculator = new Marketman.InventoryCalculator();
    var avt = calculator.avtIntervalFor("PORK NECK SOUVLAKI MARINATED 100gr 6.4gr", 7);
    Logger.log(avt);
    
}

function testAvt() {
    var calculator = new Marketman.InventoryCalculator();
    calculator.updateSummaryDataSpreadsheet();
}

function testDaysAgo() {
    var date = new Date();
    var pastDate = getDaysAgo(date, 10);
    Logger.log(date+" -> "+pastDate);
}