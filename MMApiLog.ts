namespace Marketman {
    export class SSLogger {
        //static sheetId: string = "1epnaIS1mnh5FMeG7B98dAEsyKr5peDTcGlMY5cfy4kY";
        static sheetName: string = "MarketmanApiLogger";

        public static logCall(endpoint: string, parameters: any, response: any) {
            var ss = SpreadsheetApp.getActiveSpreadsheet();
            var sheet = ss.getSheetByName(this.sheetName);
            var newRow = [];
            // Set the timestamp row;
            newRow[0] = new Date();
            newRow[1] = endpoint;
            newRow[2] = JSON.stringify(parameters);
            newRow[3] = JSON.stringify(response);
            sheet.appendRow(newRow);
            sheet.getRange(sheet.getLastRow() - 1, 1, 1, sheet.getLastColumn()).copyFormatToRange(sheet, 1, sheet.getLastColumn(), sheet.getLastRow(), sheet.getLastRow());
        }
    }
}