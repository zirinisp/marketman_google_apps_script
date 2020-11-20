var marketmanLogginSSId = "1KlI1gcozf4BY_7neV98ma5fHhixSwIudk-v8zocKX1Q";
var loggingSSName = "MarketmanApiLogger";
var LoggingServerURL = "https://script.google.com/macros/s/AKfycbwOS4VRxC78OrfgD3uYpBChHcVmgPCrTpN4k8N7XIgmsc9L8ixS/exec";
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

function doPost(request) {
    if (request != null) {
      //try {
        var ss = SpreadsheetApp.openById(marketmanLogginSSId);
        var sheet = ss.getSheetByName(loggingSSName);
        var lock = LockService.getScriptLock();
        lock.tryLock(10000);
        var firstRowRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  
        var sheetHeaders = firstRowRange.getValues();
        // columns start at one, but arrays start at 0, so this is the right number for inserting into an array that will be placed into the columns
        var newColumnArrayCount = sheet.getLastColumn();
  
        // initialize new row to be inserted before it gets filled with data
        var newRow = new Array(sheetHeaders[0].length);
        // Set the timestamp row;
        newRow[0] = new Date();
        // Get JSON and convert to Dictionary
        var json = JSON.parse(request.postData.contents);
        // Set all the other rows to ""
        for (var x = 1; x < newColumnArrayCount; x++) newRow[x] = "";
        //var slack = new PostToSlack(slackIncomingWebhookUrl);
  
        for (var parameter in json) {
          var foundRow = false;
          for (var x = 1; x < sheetHeaders[0].length; x++) {
            // Go through headers to find a match
            if (parameter.toString().toLowerCase() == sheetHeaders[0][x].toString().toLowerCase()) {
              var currentpar = json[parameter];
              newRow[x] = currentpar;
              foundRow = true;
              break;
            }
          }
          // If no header found add it
          if (foundRow == false) {
            if (sheet.getLastColumn() == sheet.getMaxColumns()) {
              sheet.insertColumnAfter(sheet.getLastColumn());
            }
            sheetHeaders[0][newColumnArrayCount] = parameter;
            newRow[newColumnArrayCount] = json[parameter];
            firstRowRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() + 1);
            firstRowRange.setValues(sheetHeaders);
            firstRowRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
            sheetHeaders = firstRowRange.getValues();
            newColumnArrayCount++;
          }
        }
  
        // Appends a new row to the bottom of the
        // spreadsheet containing the values in the array
        sheet.appendRow(newRow);
        sheet.getRange(sheet.getLastRow() - 1, 1, 1, sheet.getLastColumn()).copyFormatToRange(sheet, 1, sheet.getLastColumn(), sheet.getLastRow(), sheet.getLastRow());  // New from SEBASTIAN CORONA FERNANDEZ 11/8/16 in Sheet chat (!)
        SpreadsheetApp.flush(); //forces the script to actually send the values to Sheets
        lock.releaseLock();
      //} catch(error) {
        //var slack = new PostToSlack(slackIncomingWebhookUrl);
        //slack.post("test", "LogginServer.js", "error: "+error);
      //}
    }  
  }
  