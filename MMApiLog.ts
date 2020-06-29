namespace Marketman {
    export class SSLogger {
        //static sheetId: string = "1epnaIS1mnh5FMeG7B98dAEsyKr5peDTcGlMY5cfy4kY";
        static sheetName: string = "MarketmanApiLogger";

        public static logCall(endpoint: string, parameters: any, response: any) {
            try {
                var queryData = {};
                // Set the timestamp row;
                queryData["Timestamp"] = new Date();
                queryData["EndPoint"] = endpoint;
                queryData["Parameters"] = JSON.stringify(parameters);
                queryData["Response"] = JSON.stringify(response);
                var json = JSON.stringify(queryData);
                var endPointURL = LoggingServerURL;

    
                // Request Options
                var params: URLFetchRequestOptions = {
                    method: 'post',
                    contentType: 'application/json',
                    payload: json
                };
                // Make a POST request with a JSON payload.
                var requestResponse = UrlFetchApp.fetch(endPointURL, params);
                
            } catch (error) {
                Logger.log(error);
            }
        }
    }
}