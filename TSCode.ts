function getProductId(productName: string, startDate: Date, endDate: Date): string {
    if ((productName == null) || (productName === "") || (startDate == null) || (endDate == null)) {
        return null;
    }
    var data = new SheetHeadedData("Inventory Counts", new SSHeadedRange(0, 0, 0, 0, 4, 5));
    data.getValues();
    var dateKey = "countDateUTC";
    var productIdKey = "item.itemID";
    var productNameKey = "item.itemName";
    var values = data.values;
    var productId: string = null;
    values.forEach(value => {
        var date: Date = value[dateKey];
        var valueProductId = value[productIdKey];
        var valueProductName = value[productNameKey];
        if (valueProductName === productName) {
            if (date) {
                if (date >= startDate && date <= endDate) {
                    productId = valueProductId;
                    return;
                }
            }
        }
    });
    return productId;
}
/**
 * @param  {string} productName Name of the Product / Item Name
 * @param  {[[]]} watchForUpdates Cells that when updated the fuctions will recalculate
 * @returns Date
 */
function getInventoryCountDates(productName: string, watchForUpdates: [[]]): Date[] {
    if (productName == null || productName === "") {
        return null;
    }
    var data = new SheetHeadedData("Inventory Counts", new SSHeadedRange(0, 0, 0, 0, 4, 5));
    data.getValues();
    var dateKey = "countDateUTC";
    var productNameKey = "item.itemName";
    var values = data.values;
    var countDates: Date[] = [];
    values.forEach(value => {
        var date: Date = value[dateKey];
        var valueProductName = value[productNameKey];
        if (valueProductName === productName) {
            countDates.push(date);
        }
    });
    if (countDates.length == 0) {
        return null;
    }
    return countDates;
}

function getInventoryCountDateBefore(productName: string, beforeDate: Date, watchForUpdates: [[]]): Date {
    if ((productName == null) || (productName === "") || (beforeDate == null)) {
        return null;
    }

    var countDates = getInventoryCountDates(productName).sort((a, b) => a.getTime() - b.getTime());
    if (countDates.length == 0) {
        return null;
    }
    var returnDate: Date = null;
    countDates.forEach(date => {
        if (date <= beforeDate) {
            returnDate = date;
            return;
        }
    });
    return returnDate;
}


function getMovementSingleProduct(itemID: string, inputDates: [Date, Date], headerString: string): any[][] {
    // To avoid multiple calls at the same time.
    Utilities.sleep(Math.random() * 5000);
    // To Test it we can run -> return [[productName, dates.toString(), headers.toString()]]
    var buyerApi = new Marketman.BuyerApi(mmApiKey, mmApiPassword);
    var data = [];
    var headers = headerString.toString().split(',');
    itemID = itemID.toString();

    var dates: [Date, Date];

    if (inputDates.map) {
        dates = inputDates;
    } else {
        throw "Input Dates are not correct";
    }

    dates.forEach(startEndDates => {
        var startDate: Date = startEndDates[0];
        var endDate: Date = startEndDates[1];
        var item: Marketman.AVTItem;

        if (!startDate || !endDate) {
            Logger.log("Dates Not Found");
            item = Marketman.AVTItem.emptyItem(itemID, null, null);

        } else {
            var mmStartDate = Marketman.InventoryDate.fromDate(startDate);
            var mmEndDate = Marketman.InventoryDate.fromDate(endDate);

            var avt = buyerApi.getActualVsTheoritical(mmStartDate, mmEndDate, buyerApi.firstBuyerContaining("Paddington"));
            Logger.log(avt);
            item = avt.itemWithID(itemID);
        }
        if (item == null) {
            item = Marketman.AVTItem.emptyItem(itemID, mmStartDate.dateValue(), mmEndDate.dateValue());
        }
        Logger.log(item);
        var dic = item.toFlatDictionary();
        Logger.log("dictionary");
        Logger.log(dic);
        var values = [];
        headers.forEach(key => {
            values.push(dic[key] || "");
        });
        Logger.log(values);
        data.push(values);
    });
    Logger.log(data);
    return data;
}