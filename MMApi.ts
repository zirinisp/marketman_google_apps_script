// TODO: Include request data on responses. This way we get a better idea on from/to dates, buyerGuid, etc.

import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

namespace Marketman {
    class Token {
        token: string;
        expiryDate: Date;
        error: string;

        constructor(token?: string, expiryDate?: Date, error?: string) {
            this.token = token || "";
            this.expiryDate = expiryDate || new Date();
            this.error = error || "";
        }

        public equals(obj: Token): boolean {
            return ((this.token == obj.token) &&
                (this.expiryDate == obj.expiryDate) &&
                (this.error == obj.error)
            );
        }

        active(): boolean {
            if (this.token == "") {
                Logger.log("Token empty: " + this.token);
                return false;
            }
            return !this.expired();
        }

        expired(): boolean {
            if ((new Date()) > this.expiryDate) {
                Logger.log("Token expired");
                return true;
            }
            if (this.token == "") {
                Logger.log("Token empty");
                return true;
            }
            return false;
        }
    }

    enum EndPoint {
        GetToken = "auth/GetToken",
        GetAuthorisedAccounts = "partneraccounts/GetAuthorisedAccounts",
        GetTokenDetails = "auth/GetTokenDetails",
        GetInventoryCounts = "inventory/GetInventoryCounts",
        GetActualVsTheoretical = "inventory/GetActualVsTheoretical",
        GetInventoryItems = "inventory/GetInventoryItems",
    }


    export function convertDateToString(date: Date) {
        var timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

        let formatted_date = Utilities.formatDate(date, timezone.toString(), 'yyyy/MM/dd HH:mm:ss')
        //let formatted_date = date.getFullYear() + "/" + appendLeadingZeroes(date.getMonth() + 1) + "/" + appendLeadingZeroes(date.getDate()) + " " + appendLeadingZeroes(date.getHours()) + ":" + appendLeadingZeroes(date.getMinutes()) + ":" + appendLeadingZeroes(date.getSeconds());
        return formatted_date;
    };


    export function convertStringToDate(mmDateString: string) {
        var stringValue = (mmDateString.replace(" ", "T").replace("/", "-").replace("/", "-"))+"Z";
        var date = new Date(Date.parse(stringValue));
        return date;
    }

    export class BuyerApi {

        key: string;
        password: string;
        buyerURL = "https://api.marketman.com/v3/buyers/";
        token = new Token();
        authorisedAccounts?: AuthorisedAccounts;

        constructor(key: string, password: string) {
            this.key = key;
            this.password = password;
        }

        getStoredToken(): Token {
            var dataString = PropertiesService.getDocumentProperties().getProperty("MMToken");
            if (!dataString) {
                return null;
            }
            var data = JSON.parse(dataString);
            Logger.log("Found Stored Token: " + data);
            var tokenString: string = data["token"];
            var expiryDate = new Date();
            expiryDate.setTime(data["expiryDate"]);

            var error: string = data["error"];
            if (!tokenString || !expiryDate) {
                Logger.log("Token Could not be used " + expiryDate);
                return null;
            }
            var token = new Token(tokenString, expiryDate, error);
            Logger.log("Retrieved Token " + token);
            return token;
        }

        storeToken() {
            var data: { [id: string]: any } = {
                "token": this.token.token,
                "expiryDate": this.token.expiryDate.getTime(),
                "error": this.token.error
            };
            var jsonString = JSON.stringify(data);
            Logger.log("Storing New Token");
            Logger.log(data + " => " + jsonString);
            PropertiesService.getDocumentProperties().setProperty("MMToken", jsonString);
        }

        clearToken() {
            PropertiesService.getDocumentProperties().deleteProperty("MMToken");
        }

        // Get a token to make requests. If there is an active token, it is returned and no request is made.
        getToken(force?: boolean): Token {
            if (force != true) {
                if (this.token.active()) {
                    return this.token;
                }
            }

            var storedToken = this.getStoredToken();
            if (storedToken && storedToken.active()) {
                this.token = storedToken;
                return storedToken;
            }

            var endPointURL = this.buyerURL + EndPoint.GetToken;

            // Query Data
            var queryData = {
                'APIKey': this.key,
                'APIPassword': this.password
            };

            // Request Options
            var params: URLFetchRequestOptions = {
                method: 'post',
                contentType: 'application/json',
                payload: JSON.stringify(queryData)
            };
            // Make a POST request with a JSON payload.
            var response = UrlFetchApp.fetch(endPointURL, params);
            var responseText = response.getContentText();
            Marketman.SSLogger.logCall(EndPoint.GetToken, params, responseText);
            var token = new Token();
            // Convert Response to JSon Data
            if (responseText) {
                var responseDictionary = JSON.parse(responseText);
                var tokenString = responseDictionary.Token;
                var expiryDateString = responseDictionary.ExpireDateUTC;
                var expiryDate: Date;
                if (expiryDateString) {
                    expiryDate = convertStringToDate(expiryDateString);
                } else {
                    expiryDate = new Date();
                }
                var error = responseDictionary.ErrorMessage || "";
                token = new Token(tokenString, expiryDate, error);
                this.token = token;
                this.storeToken();
            }
            return this.token;
        }

        getTokenDetails(): {} {
            var endPoint = EndPoint.GetTokenDetails;
            var queryData = {};
            var response = this.buyerRequestDictionary(endPoint, queryData, endPoint, false);
            Marketman.SSLogger.logCall(endPoint, queryData, response);
            return response;
        }

        /**
         * 
         * @param {String} endPoint String Endpoint. ex: "docs/GetDocsByDocDate"
         * @param {[]} query Dictionary with query items
         * @return {string} response.
         
         */
        buyerRequest(endPoint: string, query: {}): string {

            var endPointURL = this.buyerURL + endPoint;

            var jsonQuery = JSON.stringify(query);
            // Request Options
            var options: URLFetchRequestOptions = {
                method: 'post',
                contentType: 'application/json',
                headers: { AUTH_TOKEN: this.getToken().token },
                payload: jsonQuery
            };

            Logger.log("Sending request "+endPoint+" "+jsonQuery);

            // Make a POST request with a JSON payload.
            var response = UrlFetchApp.fetch(endPointURL, options);
            var responseText = response.getContentText();
            Marketman.SSLogger.logCall(endPoint, options, responseText);
            return responseText;
        }

        /**
         * 
         * @param {String} endPoint String Endpoint. ex: "docs/GetDocsByDocDate"
         * @param {[]} query Dictionary with query items
         * @return {[]} response converted to dictionary.
         
         */
        buyerRequestDictionary(endPoint: string, query: {}, cacheKey: string, useCache: Boolean): {} {
            var responseText: string = null;
            var chunky = ChunkyCache(CacheService.getDocumentCache(), 1024*90);
            var freshData = false;
            if (useCache) {
                responseText = chunky.get(cacheKey);
            }
            if (responseText == null) {
                responseText = this.buyerRequest(endPoint, query);
                freshData = true;
            } else {
                Logger.log("Using cache "+cacheKey);
            }
            // Convert Response to JSon Data
            if (responseText) {
                var responseDictionary = JSON.parse(responseText);
                if (freshData && responseDictionary.isSuccess) {
                    Logger.log("Saving to cache "+cacheKey);
                    chunky.put(cacheKey, responseText, 500);
                }
                return responseDictionary;
            }
        }

        getAuthorisedAccounts(force?: boolean): AuthorisedAccounts {
            force = force || false;
            if (this.authorisedAccounts && !(force)) {
                return this.authorisedAccounts;
            }
            var endPoint = EndPoint.GetAuthorisedAccounts;
            var response = this.buyerRequestDictionary(endPoint, {}, endPoint, true);

            var authorizedAccounts = Marketman.AuthorisedAccounts.fromJSON(response);

            Logger.log("getAuthorizedAccounts");
            Logger.log(authorizedAccounts);

            Logger.log("All Buyers");
            Logger.log(authorizedAccounts.allBuyers());

            this.authorisedAccounts = authorizedAccounts;
            return authorizedAccounts;
        }

        firstBuyerContaining(name: string): Buyer {
            if (this.defaultBuyer().name.includes(name)) {
                return this.defaultBuyer();
            }
            var buyers = this.buyersContaining(name);
            if (buyers.length > 0) {
                return buyers[0];
            }
            return null;
        }

        buyersContaining(name: string): Buyer[] {
            Logger.log(this.getAuthorisedAccounts().allBuyers());
            return this.getAuthorisedAccounts().buyersContaining(name);
        }

        _defaultBuyer?: Buyer;
        defaultBuyer(): Buyer {
            if (this._defaultBuyer) {
                return this._defaultBuyer;
            }
            var dataString = PropertiesService.getDocumentProperties().getProperty("MMDefaultBuyer");
            if (!dataString) {
                var buyer: Buyer = null;
                if (this.getAuthorisedAccounts().buyers.length != 0) {
                    buyer = this.getAuthorisedAccounts().buyers[0];
                }
                if (this.getAuthorisedAccounts().chains.length != 0 && this.getAuthorisedAccounts().chains[0].buyers.length != 0) {
                    buyer = this.getAuthorisedAccounts().chains[0].buyers[0];
                }
                this._defaultBuyer = buyer;
                return buyer;
            }
            var data = JSON.parse(dataString);
            Logger.log("Found Default Buyer: " + data);
            var name: string = data["name"];
            var guid: string = data["guid"];
            var buyer = new Marketman.Buyer(name, guid);
            Logger.log("Retrieved Buyer " + buyer);
            this._defaultBuyer = buyer;
            return buyer;
        }

        setDefaultBuyer(buyer: Buyer) {
            var data: { [id: string]: any } = {
                "name": buyer.name,
                "guid": buyer.guid
            };
            var jsonString = JSON.stringify(data);
            Logger.log("Storing New Buyer");
            Logger.log(data + " => " + jsonString);
            PropertiesService.getDocumentProperties().setProperty("MMDefaultBuyer", jsonString);
        }

        getInventoryCounts(fromDate: Date, toDate: Date = new Date(), getLineDetails: Boolean = true, buyer: Buyer = this.defaultBuyer()): InventoryCountResponse {
            var endPoint = EndPoint.GetInventoryCounts;
            var fromDateString = convertDateToString(fromDate);
            var toDateString = convertDateToString(toDate);
            var queryData = {
                'DateTimeFromUTC': fromDateString,
                'DateTimeToUTC': toDateString,
                'BuyerGUID': buyer.guid,
                'GetLineDetails': getLineDetails
            };
            var cacheKey = endPoint+"-"+fromDateString+"-"+toDateString+"-"+buyer.guid+"-"+getLineDetails;
            Logger.log(queryData);
            var response = this.buyerRequestDictionary(endPoint, queryData, cacheKey, true);
            var inventoryResponse = Marketman.InventoryCountResponse.fromJSON(response, fromDate, toDate, getLineDetails, buyer.guid);
            return inventoryResponse;
        }

        getActualVsTheoritical(startDate: InventoryDate, endDate: InventoryDate, buyer: Buyer = this.defaultBuyer(), useCache: Boolean = true): ActualVsTheoritical {
            var endPoint = EndPoint.GetActualVsTheoretical;
            var startDateString = startDate.stringValue();
            var endDateString = endDate.stringValue();
            var queryData = {
                'StartDateUTC': startDateString,
                'EndDateUTC': endDateString,
                'BuyerGUID': buyer.guid
            };
            var cacheKey = endPoint+"-"+startDateString+"-"+endDateString+"-"+buyer.guid;
            Logger.log(queryData);
            var response = this.buyerRequestDictionary(endPoint, queryData, cacheKey, useCache);
            Logger.log(".. "+ startDate + " => " + startDate.dateValue());
            var avtResponse = Marketman.ActualVsTheoritical.fromJSON(response, startDate.dateValue(), endDate.dateValue(), buyer.guid);
            return avtResponse;
        }

        getInventoryItems(buyer: Buyer = this.defaultBuyer(), getDeleted: boolean = false, itemIDs: string[] = null): InventoryItemsResponse {
            var endPoint = EndPoint.GetInventoryItems;
            var queryData = {
                'GetDeleted': getDeleted,
                'BuyerGUID': buyer.guid
            };
            var cacheKey = endPoint+"-"+getDeleted+"-"+buyer.guid;
            if (itemIDs != null) {
                queryData['ItemIDs'] = itemIDs;
                cacheKey += "-"+itemIDs.join(".");
            }
            Logger.log(queryData);
            var response = this.buyerRequestDictionary(endPoint, queryData, cacheKey, true);
            var iiResponse = Marketman.InventoryItemsResponse.fromJSON(response, new Date());
            return iiResponse;
        }
    }
}

// Applies leading 0. Used for date formatting
function appendLeadingZeroes(n) {
    if (n <= 9) {
        return "0" + n;
    }
    return n
}






