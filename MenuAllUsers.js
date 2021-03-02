// Created a web service, so users all users can access the menu. Without it and a protected sheet, they could not update.

function doGet(e) {
    var value = e.parameter.value;
    Logger.log("Do Get " + "value = " + value);// shows the actual url with parameters, can be tested in a browser

    switch (value) {
        case "updateSummaryData":
            updateSummaryData();
            break;
        case "updateInventoryItemsAndCounts":
            updateInventoryItemsAndCounts();
            break;
        case "updateSingleProduct":
            updateSingleProduct();
            break;
        case "updateActualVsTheoritical":
            updateActualVsTheoritical();
            break;
        default:
            return ContentService.createTextOutput('error').setMimeType(ContentService.MimeType.TEXT);
            break;
    }
    return ContentService.createTextOutput('Running Script').setMimeType(ContentService.MimeType.TEXT);

}

var url = "https://script.google.com/macros/s/AKfycbwjjClkTF8mCUxn77LQrCPazkpO74mnQVDrfSK-b7GKhJz9LleteKiy5A/exec";

function sheetService(value) {
    Logger.log(url + "?value=" + value);// shows the actual url with parameters, can be tested in a browser
    var result = UrlFetchApp.fetch(url + "?value=" + value);
    return result
}

function updateSummaryDataWeb() {
    sheetService("updateSummaryData");
}

function updateInventoryItemsAndCountsWeb() {
    sheetService("updateInventoryItemsAndCounts");
}

function updateSingleProductWeb() {
    sheetService("updateSingleProduct");
}

function updateActualVsTheoriticalWeb() {
    sheetService("updateActualVsTheoritical");
}
