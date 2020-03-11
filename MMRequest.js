var mmToken = "";
var mmTokenExpiryDate = Date.now();
var mmTokenError = "";
var mmBuyerURL = "https://api.marketman.com/v3/buyers/";


function testGetToken() {
    var initialToken = getToken();
    var initialTokenExpiry = mmTokenExpiryDate;
    Logger.log(mmToken+"  "+mmTokenExpiryDate+"  "+mmTokenError);
    var secondaryToken = getToken();
    Logger.log(mmToken+"  "+mmTokenExpiryDate+"  "+mmTokenError);
    if (initialToken == secondaryToken) {
        Logger.log("Success: Double token request was avoided");
    } else {
        Logger.log("Fail: Double token request was not avoided");
    }
    var forceToken = getToken(true);
    if (forceToken != initialToken) {
        Logger.log("Success: Force worked");
    } else {
        Logger.log("Fail: Foce did not work");
    }
}

// Get a token to make requests. If there is an active token, it is returned and no request is made.
function getToken(force) {
    force = force || false;
    var endPointURL = mmBuyerURL+"auth/GetToken"
    var apiKey = "dfc5da790bf6416e811a4fd604909745";
    var apiPassword = "e2e95754ddcf43b0bfe2e0d0ecc6ca2b";
    if ((mmToken != "") && (Date.now() < mmTokenExpiryDate) && !(force)) {
        return mmToken;
    }
    // Query Data
    var queryData = {
        'APIKey': apiKey,
        'APIPassword' : apiPassword
    };
    
    // Request Options
    var options = {
        'method' : 'post',
        'contentType': 'application/json',
        //'headers': {authorization: "Bearer " + authToken},
        // Convert the JavaScript object to a JSON string.
        'payload' : JSON.stringify(queryData)
    };

    // Make a POST request with a JSON payload.
    var response = UrlFetchApp.fetch(endPointURL, options);
    var responseText = response.getContentText();
    //Logger.log(responseText);
  
    // Convert Response to JSon Data
    if (responseText) {
      var responseDictionary = JSON.parse(responseText);
      mmToken = responseDictionary.Token;
      var expiryDateString = responseDictionary.ExpireDateUTC;
      if (expiryDateString) {
        mmTokenExpiryDate = convertMMSTringToDate(expiryDateString);
      } else {
        mmTokenExpiryDate = Date.now;
      }
      mmTokenError = responseDictionary.ErrorMessage || "";
    }
    return mmToken;
}

function testBoth() {
    testMMBuyerRequestTokenDetails();
    testMMBuyerRequestInventoryCounts();
}

function testMMBuyerGetAuthorisedAccounts() {
    var endPoint = "partneraccounts/GetAuthorisedAccounts";
    var queryData = {};
    var response = mmBuyerRequest(endPoint, queryData);
    Logger.log("Token: "+mmToken+"\n"+"Expiry Date: "+mmTokenExpiryDate);
    Logger.log("End Point: "+endPoint+"\n"+"Query Data: ");
    Logger.log(queryData);
    Logger.log("--- RESPONSE ----\n");
    Logger.log(response);
  
}

function testMMBuyerRequestInventoryCounts() {
    var endPoint = "inventory/GetInventoryCounts";
    var fromDate = new Date(new Date().setDate(new Date().getDate()-5));
    var toDate = new Date();
    var getLineDetails = true;
    var queryData = {
        'DateTimeFromUTC': convertDateToMMString(fromDate),
        'DateTimeToUTC' : convertDateToMMString(toDate),
        'BuyerGUID': mmBuyerGUID,
        'GetLineDetails' : getLineDetails
    };
    var response = mmBuyerRequest(endPoint, queryData);
    Logger.log("Token: "+mmToken+"\n"+"Expiry Date: "+mmTokenExpiryDate);
    Logger.log("End Point: "+endPoint+"\n"+"Query Data: ");
    Logger.log(queryData);
    Logger.log("--- RESPONSE ----\n");
    Logger.log(response);
  
}
function testMMBuyerRequestTokenDetails() {
    var endPoint = "auth/GetTokenDetails";
    var queryData = {};
    var response = mmBuyerRequest(endPoint, queryData);
    Logger.log("Token: "+mmToken+"\n"+"Expiry Date: "+mmTokenExpiryDate);
    Logger.log("End Point: "+endPoint+"\n"+"Query Data: ");
    Logger.log(queryData);
    Logger.log("--- RESPONSE ----\n");
    Logger.log(response);
}
/**
 * 
 * @param {String} endPoint String Endpoint. ex: "docs/GetDocsByDocDate"
 * @param {[]} query Dictionary with query items
 * @return {[]} response converted to dictionary.

 */
function mmBuyerRequest(endPoint, query) {

    var endPointURL = mmBuyerURL+endPoint;
    // Request Options
    var options = {
        'method': 'post',
        'contentType': 'application/json',
        'headers': { AUTH_TOKEN: getToken() },
        // Convert the JavaScript object to a JSON string.
        'payload': JSON.stringify(query)
    };

    
    // Make a POST request with a JSON payload.
    var response = UrlFetchApp.fetch(endPointURL, options);
    var responseText = response.getContentText();

    // Convert Response to JSon Data
    if (responseText) {
        var responseDictionary = JSON.parse(responseText);
        return responseDictionary;
    }
}
// Applies leading 0. Used for date formatting
function appendLeadingZeroes(n){
    if(n <= 9){
      return "0" + n;
    }
    return n
}

function convertDateToMMString(date) {
    let formatted_date = date.getFullYear() + "/" + appendLeadingZeroes(date.getMonth() + 1) + "/" + appendLeadingZeroes(date.getDate()) + " " + appendLeadingZeroes(date.getHours()) + ":" + appendLeadingZeroes(date.getMinutes()) + ":" + appendLeadingZeroes(date.getSeconds());
    return formatted_date;
};


function convertMMSTringToDate(mmDateString) {
    date = new Date(mmDateString);
    return date;
}