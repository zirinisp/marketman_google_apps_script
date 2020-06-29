namespace Marketman {
    export class InventoryCalculator {
        countDates = new Marketman.InventoryCountDates();
        buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
        spreadsheetName = "Summary Data";

        lastItemInventoryKey = "Latest Item Inventory";
        searchStartKey = "searchStart";
        searchEndKey = "searchEnd";
        productIdKey = "productID";

        countData = new SheetHeadedData(this.spreadsheetName, new SSHeadedRange(0, 0, 0, 0, 4, 6));

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
            startDate.setDate(endDate.getDate() - dayInterval);
            startDate = this.countDates.countDateBefore(productName, startDate);
            return this.avtFor(productName, startDate, endDate);
        }

        avtFor(productName: string, startDate: Date, endDate: Date) : AVTItem {
            var mmStartDate = Marketman.InventoryDate.fromDate(startDate);
            var mmEndDate = Marketman.InventoryDate.fromDate(endDate);

            var avt = this.buyerApi.getActualVsTheoritical(mmStartDate, mmEndDate, this.buyerApi.firstBuyerContaining("Paddington"));
            Logger.log(avt);
            var item = avt.itemForName(productName);
            return item;            
        }

        excludedKey(key: String) {
            if (key.endsWith(this.searchStartKey) || key.endsWith(this.searchEndKey) || key.endsWith("isSuccess") || key.endsWith("errorMessage")) {
                return true;
            }
            return false;
        }
        updateAvtSpreadsheet() {
            var intervalDays = [6,30,60];
            this.countData.values.forEach(element => {
                var productName = element["Product Name"];
                var endDate = this.countDates.lastDateFor(productName);
                if (!endDate) {
                    Object.keys(element).forEach(key => {
                        if (key[1] == "-") {
                            element[key] = "";
                        }
                    });  
                    element[this.lastItemInventoryKey] = "";
                    return;
                }
                element[this.lastItemInventoryKey] = endDate;
                var i = 1;
                var avts: { [id: string]: any }[] = [];
                intervalDays.forEach(intervalDay => {
                    var startDate = new Date();
                    startDate.setDate(endDate.getDate() - intervalDay);
                    startDate = this.countDates.countDateBefore(productName, startDate);
                    element[i+"-"+this.searchStartKey] = startDate;
                    element[i+"-"+this.searchEndKey] = endDate;
                    
                    var avt = this.avtFor(productName, startDate, endDate);
                    if (avt) {
                        avts[i-1] = avt.toFlatDictionary();
                    } else {
                        avts[i-1] = {};
                    }
                    i++;
                });
                Object.keys(element).forEach(key => {
                    if (key[1] != "-" || isNaN(+key[0])) {
                        return;
                    }
                    var i : number = +key[0];
                    var avt = avts[i];
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
    calculator.updateAvtSpreadsheet();
}