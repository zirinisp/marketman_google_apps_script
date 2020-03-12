namespace Marketman {
        /* INVENTORY COUNTS */

        export class InventoryCountResponse {
            inventoryCounts: InventoryCount[];
            isSuccess: boolean;
            errorMessage: string;
            errorCode: string;

            constructor(
                inventoryCounts: InventoryCount[],
                isSuccess: boolean,
                errorMessage: string,
                errorCode: string
            ){
                this.inventoryCounts = inventoryCounts;
                this.isSuccess = isSuccess;
                this.errorMessage = errorMessage;
                this.errorCode = errorCode;
            }
            
            static fromJSON(json: {[id: string] : any}): InventoryCountResponse {
                return new InventoryCountResponse(
                    InventoryCount.fromJSONArray(json.InventoryCounts),
                    json.IsSuccess,
                    json.ErrorMessage,
                    json.ErrorCode
                );
            }

            inventoryCountsArray(): [{[id: string] : any}] {
                var data: [{[id: string] : any}] = [{}];
                this.inventoryCounts.forEach(inventoryCount => {
                    data.push(...inventoryCount.toFlatArray());
                });
                return data;
            }
        }
    
        export class InventoryCount {
            id: string;
            buyerName: string;
            buyerGuid: string;
            countDateUTC: Date;
            priceTotalWithoutVAT: number;
            commments: string;
            lines: InventoryLine[];

            constructor(
                id: string,
                buyerName: string,
                buyerGuid: string,
                countDateUTC: Date,
                priceTotalWithoutVAT: number,
                commments: string,
                lines: InventoryLine[]
            ) {
                this.id = id;
                this.buyerName = buyerName;
                this.buyerGuid = buyerGuid;
                this.countDateUTC = countDateUTC;
                this.priceTotalWithoutVAT = priceTotalWithoutVAT;
                this.commments = commments;
                this.lines = lines;
            }
    
            static fromJSON(json: {[id: string] : any}): InventoryCount {
                return new InventoryCount(
                    json.ID,
                    json.BuyerName,
                    json.BuyerGuid,
                    Marketman.convertStringToDate(json.CountDateUTC),
                    json.PriceTotalWithoutVAT,
                    json.Commments,
                    InventoryLine.fromJSONArray(json.Lines)
                );
            }

            public static fromJSONArray(jsonArray: []): InventoryCount[] {
                var chains: InventoryCount[] = [];
                jsonArray.forEach(json => {
                    chains.push(InventoryCount.fromJSON(json));
                });
                return chains;
            }

            public toFlatArray(): {[id: string] : any}[] {

                var data: {[id: string] : any}[] = [{}];
                this.lines.forEach(line => {
                    var inventoryCountData = {
                        "id": this.id,
                        "buyerName": this.buyerName,
                        "buyerGuid": this.buyerGuid,
                        "countDateUTC": this.countDateUTC,
                        "priceTotalWithoutVAT": this.priceTotalWithoutVAT,
                        "commments": this.commments
                    }    
                    for (let key in line.toFlatDictionary()) {
                        let value = line[key];
                        inventoryCountData["item."+key] = value;
                    }
                    data.push(inventoryCountData);
                });
                return data;
            }

            public static headers(): string[] {
                var headers = [
                    "id",
                    "buyerName",
                    "buyerGuid",
                    "countDateUTC",
                    "priceTotalWithoutVAT",
                    "commments"
                ];
                InventoryLine.headers().forEach(header => {
                    headers.push("item."+header);
                });
                return headers;
            }
        }
    
        export class InventoryLine {
            lineID: string;
            itemID: string;
            itemName: string;
            totalCount: number;
            totalValue: number;
    
            constructor(
                lineID: string,
                itemID: string,
                itemName: string,
                totalCount: number,
                totalValue: number
            ) {
                this.lineID = lineID;
                this.itemID = itemID;
                this.itemName = itemName;
                this.totalCount = totalCount;
                this.totalValue = totalValue;
            }

            public toFlatDictionary(): {[id: string] : any} {

                var data = {
                    "lineID": this.lineID,
                    "itemID": this.itemID,
                    "itemName": this.itemName,
                    "totalCount": this.totalCount,
                    "totalValue": this.totalValue,
                }
                return data;
            }

            public static headers(): string[] {
                var headers = [
                    "lineID",
                    "itemID",
                    "itemName",
                    "totalCount",
                    "totalValue"
                ];
                return headers;
            }

            static fromJSON(json: {[id: string] : any}): InventoryLine {
                return new InventoryLine(
                    json.LineID,
                    json.ItemID,
                    json.ItemName,
                    json.TotalCount,
                    json.TotalValue
                );
            }

            public static fromJSONArray(jsonArray: []): InventoryLine[] {
                var lines: InventoryLine[] = [];
                jsonArray.forEach(json => {
                    lines.push(InventoryLine.fromJSON(json));
                });
                return lines;
            }
        }
    
}