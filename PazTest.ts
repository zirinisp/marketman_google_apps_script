
function testPazSheetHeaderData() {
    var sheetName = "Movement Single Product";
    var sheetRange = new SSHeadedRange(1, 1, 0, 0, 4, 6);

    var sheetHeaderData = new SheetHeadedData(sheetName, sheetRange);
    sheetHeaderData.getValues();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    Logger.log(sheet.getMaxRows());
    Logger.log("======HEADERS========");

    Logger.log(sheetHeaderData.headers);

    Logger.log("======VALUES========");
    Logger.log("Length: " + sheetHeaderData.values.length);
    sheetHeaderData.values.forEach(element => {
        Logger.log(element);
    });

}

function testCopy() {
    var sheetName = "Movement Single Product";
    var sheetRange = new SSHeadedRange(1, 1, 0, 0, 4, 6);

    var sheetHeaderData = new SheetHeadedData(sheetName, sheetRange);
    sheetHeaderData.getValues();

    sheetHeaderData.sheetName = "ASTest";
    sheetHeaderData.writeValues();
}

function testGetSpreadsheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var newSheet = ss.getSheetByName("ASTest");
    Logger.log(newSheet.getName());
    var sheets = ss.getSheets();
    Logger.log(sheets);
    sheets.forEach(sheet => {
        Logger.log(sheet.getName());

    })
    var sheetName = "ASTest";
    var sheetRange = new SSHeadedRange(1, 1, 0, 0, 1, 2);
    var sheetHeaderData = new SheetHeadedData(sheetName, sheetRange);
    sheetHeaderData.getValues();

}


function testWrite() {
    var values: [{ [index: string]: any }] = [{}];
    values.pop();   // I have no other way to init this array and spend too much time messing with this bs
    values.push(
        {
            "item.totalValue": 35.72835,
            "countDateUTC": "Tue Mar 10 23:59:59 GMT+00:00 2020",
            "buyerName": "It's All Greek To Me",
            "item.totalCount": 245.0,
            "item.itemName": "Chasioti Greek Pita 120items",
            "priceTotalWithoutVAT": 1578.88134,
            "commments": "Daily count",
            "id": 328665,
            "item.lineID": 25966739,
            "item.itemID": 25326251,
            "buyerGuid": "ab64a3535b334c4182987d961bc4800f"
        }
    );

    values.push(
        {
            "item.totalValue": 35.72835,
            "countDateUTC": "Tue Mar 10 23:59:59 GMT+00:00 2020",
            "buyerName": "It's All Greek To Me - Paddington",
            "item.totalCount": 245.0,
            "item.itemName": "Chasioti Greek 120items",
            "priceTotalWithoutVAT": 1578.88134,
            "commments": "Daily count",
            "id": 328665,
            "item.lineID": 25966739,
            "item.itemID": 25326251,
            "buyerGuid": "ab64a3535b334c4182987d961bc4800f"
        }
    );
    values.push(
        {
            "item.totalValue": 35.72835,
            "countDateUTC": "Tue Mar 10 23:59:59 GMT+00:00 2020",
            "buyerName": "It's All Greek To Me - Paddington",
            "item.totalCount": 245.0,
            "item.itemName": "Greek Pita 120items",
            "priceTotalWithoutVAT": 1578.88134,
            "commments": "Daily count",
            "id": 328665,
            "item.lineID": 25966739,
            "item.itemID": 25326251,
            "buyerGuid": "ab64a3535b334c4182987d961bc4800f"
        }
    );

    var headers = ["id", "buyerName", "buyerGuid", "countDateUTC", "priceTotalWithoutVAT", "commments", "item.lineID", "item.itemID", "item.itemName", "item.totalCount", "item.totalValue"];

    Logger.log(headers);
    Logger.log(values);

    var sheetData = new SheetHeadedData("ASTest", new SSHeadedRange(1, 1, 100, 100, 1, 2));

    sheetData.headers = headers;
    sheetData.values = values;

    sheetData.writeValues();

}