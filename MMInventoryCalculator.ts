namespace Marketman {
    export class InventoryCalculator {
        countDates = new Marketman.InventoryCountDates();
        buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
        spreadsheetName = "Summary 2";
        
        countData = new SheetHeadedData(this.spreadsheetName, new SSHeadedRange(0, 0, 0, 0, 3, 6));


        avtFor(productName: string, dayInterval: number, date: Date = null) : AVTItem {
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
            var mmStartDate = Marketman.InventoryDate.fromDate(startDate);
            var mmEndDate = Marketman.InventoryDate.fromDate(endDate);

            var avt = this.buyerApi.getActualVsTheoritical(mmStartDate, mmEndDate, this.buyerApi.firstBuyerContaining("Paddington"));
            Logger.log(avt);
            var item = avt.itemForName(productName);
            return item;            
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
            if (Object.keys(countDates).length < 1) {
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

function testAvt() {
    var calculator = new Marketman.InventoryCalculator();
    var avt = calculator.avtFor("PORK NECK SOUVLAKI MARINATED 100gr 6.4gr", 7);
    Logger.log(avt);
}